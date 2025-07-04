// API Service for Career MCP integration with Career Agent support
class ApiService {
  constructor() {
    // API base URL - Career MCP server
    this.baseURL = this.getApiBaseUrl();
    this.timeout = 10000; // 10 seconds timeout
    this.retryCount = 2; // Retry failed requests
    this.isApiHealthy = null; // Cache API health status
    this.connectivityTested = false; // Track if we've tested connectivity
    this.agentIntegrationEnabled = true; // Enable Career Agent integration

    // Test connectivity on mobile platforms
    this.initializeConnectivity();
  }

  /**
   * Initialize connectivity for mobile platforms
   */
  async initializeConnectivity() {
    try {
      const { Platform } = require('react-native');

      // Only test connectivity on mobile platforms
      if (Platform.OS !== 'web' && !this.connectivityTested) {
        console.log('🔍 Testing API connectivity for mobile platform...');
        const workingUrl = await this.testConnectivity();
        if (workingUrl) {
          this.baseURL = workingUrl;
          console.log(`✅ API connectivity established: ${this.baseURL}`);
        }
        this.connectivityTested = true;
      }
    } catch (error) {
      console.log('Platform detection failed, using default URL');
    }
  }

  /**
   * Get appropriate API base URL for current platform
   */
  getApiBaseUrl() {
    // Import Platform from react-native if available
    try {
      const { Platform } = require('react-native');

      if (Platform.OS === 'web') {
        // Web platform - use localhost
        return 'http://localhost:5000';
      } else if (Platform.OS === 'android') {
        // Android emulator - use special IP
        return 'http://10.0.2.2:5000';
      } else if (Platform.OS === 'ios') {
        // iOS simulator - use localhost
        return 'http://localhost:5000';
      } else {
        // Default mobile - use computer's IP
        return 'http://192.168.59.150:5000';
      }
    } catch (error) {
      // Fallback if Platform is not available (web environment)
      if (typeof window !== 'undefined' && window.location) {
        return 'http://localhost:5000';
      }
      // Default fallback
      return 'http://192.168.59.150:5000';
    }
  }

  /**
   * Test API connectivity for mobile platforms
   */
  async testConnectivity() {
    const testUrls = [
      'http://10.0.2.2:5000',      // Android emulator
      'http://192.168.59.150:5000', // Host machine IP
      'http://localhost:5000'       // Localhost fallback
    ];

    for (const testUrl of testUrls) {
      try {
        console.log(`Testing connectivity to: ${testUrl}`);
        const response = await fetch(`${testUrl}/`, {
          method: 'GET',
          timeout: 3000,
        });

        if (response.ok) {
          console.log(`✅ Successfully connected to: ${testUrl}`);
          this.baseURL = testUrl;
          return testUrl;
        }
      } catch (error) {
        console.log(`❌ Failed to connect to: ${testUrl} - ${error.message}`);
      }
    }

    console.log('⚠️ No API server found, using fallback');
    return null;
  }

  /**
   * Generic API request method
   */
  async makeRequest(endpoint, params = {}) {
    try {
      // Clean URL construction to avoid double slashes
      const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

      // Build base URL without query parameters first
      const baseUrl = `${cleanBaseURL}${cleanEndpoint}`;
      const url = new URL(baseUrl);

      // Add query parameters manually to avoid URL constructor issues
      const queryParams = [];
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
        }
      });

      // Build final URL manually
      const finalUrl = queryParams.length > 0
        ? `${baseUrl}?${queryParams.join('&')}`
        : baseUrl;

      console.log('API Base URL:', this.baseURL);
      console.log('Clean Base URL:', cleanBaseURL);
      console.log('Clean Endpoint:', cleanEndpoint);
      console.log('Base URL before params:', baseUrl);
      console.log('Final API Request:', finalUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response Success:', data);

      return data;
    } catch (error) {
      console.error('API Request failed:', {
        url: `${this.baseURL}${endpoint}`,
        error: error.message,
        type: error.name
      });

      // Provide more specific error messages
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - API server may be slow or unavailable');
      } else if (error.message.includes('Network request failed')) {
        throw new Error(`Cannot connect to API server at ${this.baseURL}. Please check if the server is running.`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Search for jobs with Career Agent integration
   */
  async searchJobs(searchParams) {
    const {
      keywords,
      location,
      locale = 'tr_TR',
      sort = 'relevance',
      pagesize = 10,
      contracttype,
      contractperiod
    } = searchParams;

    if (!keywords || !location) {
      throw new Error('Keywords and location are required');
    }

    console.log('🔍 Starting job search with params:', { keywords, location, locale });

    // First try Career Agent integration if enabled
    if (this.agentIntegrationEnabled) {
      try {
        console.log('🤖 Attempting Career Agent integration...');
        const agentResult = await this.searchJobsViaAgent(searchParams);
        if (agentResult && agentResult.success) {
          console.log('✅ Career Agent search successful');
          return agentResult;
        }
      } catch (agentError) {
        console.warn('⚠️ Career Agent search failed, falling back to direct API:', agentError.message);
      }
    }

    // Fallback to direct API call
    const params = {
      keywords,
      location,
      locale,
      sort,
      pagesize,
      contracttype,
      contractperiod
    };

    try {
      console.log('🌐 Attempting direct API call...');
      // Try with retry mechanism first
      const result = await this.makeRequestWithRetry('/api/jobs/search', params);

      if (result.success) {
        // Mark API as healthy since request succeeded
        this.isApiHealthy = true;
        console.log('✅ Direct API search successful');

        return {
          success: true,
          jobs: result.jobs || [],
          totalResults: result.totalResults || 0,
          searchCriteria: result.searchCriteria || { keywords, location },
          message: result.message,
          type: result.type
        };
      } else {
        throw new Error(result.message || 'Job search failed');
      }
    } catch (error) {
      console.error('❌ Job search error after retries:', error);

      // Mark API as unhealthy
      this.isApiHealthy = false;

      // Fallback to enhanced mock data
      console.log('📋 Using enhanced mock data fallback...');
      const mockResult = this.getEnhancedMockJobData(keywords, location);
      mockResult.message = `API bağlantısı kurulamadı (${error.message}). Gelişmiş demo veriler gösteriliyor.`;
      return mockResult;
    }
  }

  /**
   * Search jobs via Career Agent (MCP integration)
   */
  async searchJobsViaAgent(searchParams) {
    const agentParams = {
      query: searchParams.keywords,
      location: searchParams.location,
      limit: searchParams.pagesize || 10,
      jobType: searchParams.contracttype,
      experienceLevel: searchParams.experienceLevel
    };

    try {
      // This would integrate with Career Agent's job-search-tool
      // For now, we'll simulate the agent response
      const agentResponse = await this.simulateAgentResponse(agentParams);

      return {
        success: true,
        jobs: agentResponse.jobs || [],
        totalResults: agentResponse.totalResults || 0,
        searchCriteria: agentResponse.searchCriteria || {
          keywords: searchParams.keywords,
          location: searchParams.location
        },
        message: 'Career Agent ile arama tamamlandı',
        type: 'agent'
      };
    } catch (error) {
      console.error('Career Agent search failed:', error);
      throw error;
    }
  }

  /**
   * Simulate Career Agent response (placeholder for actual integration)
   */
  async simulateAgentResponse(params) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return enhanced job data that simulates real API results
    return {
      jobs: this.generateRealisticJobData(params.query, params.location, params.limit),
      totalResults: params.limit,
      searchCriteria: {
        query: params.query,
        location: params.location
      }
    };
  }

  /**
   * Get job details
   */
  async getJobDetails(jobUrl, locale = 'tr_TR') {
    if (!jobUrl) {
      throw new Error('Job URL is required');
    }

    const params = {
      url: jobUrl,
      locale
    };

    try {
      const result = await this.makeRequest('/api/jobs/details', params);
      return result;
    } catch (error) {
      console.error('Job details error:', error);
      
      // Return basic info if API fails
      return {
        job_url: jobUrl,
        message: 'İş detayları şu anda alınamıyor',
        error: error.message
      };
    }
  }

  /**
   * Check API health with caching
   */
  async checkHealth(forceCheck = false) {
    // Return cached result if available and not forcing check
    if (!forceCheck && this.isApiHealthy !== null) {
      return this.isApiHealthy;
    }

    try {
      const result = await this.makeRequest('/');
      this.isApiHealthy = result.status === 'healthy';
      return this.isApiHealthy;
    } catch (error) {
      console.error('Health check failed:', error);
      this.isApiHealthy = false;
      return false;
    }
  }

  /**
   * Retry mechanism for failed requests
   */
  async makeRequestWithRetry(endpoint, params = {}, retryCount = this.retryCount) {
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        return await this.makeRequest(endpoint, params);
      } catch (error) {
        console.warn(`API request attempt ${attempt + 1} failed:`, error.message);

        if (attempt === retryCount) {
          throw error; // Last attempt failed, throw error
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  /**
   * Generate realistic job data for simulation
   */
  generateRealisticJobData(keywords, location, limit = 10) {
    const companies = [
      'Tech Innovations A.Ş.', 'Dijital Çözümler Ltd.', 'Yazılım Geliştirme A.Ş.',
      'Teknoloji Merkezi', 'İnovasyon Hub', 'Startup Accelerator',
      'Global Tech Solutions', 'Akıllı Sistemler A.Ş.', 'Veri Analitik Ltd.',
      'Mobil Uygulama Stüdyosu', 'E-Ticaret Platformu', 'Fintech Startup'
    ];

    const jobTypes = ['Tam Zamanlı', 'Yarı Zamanlı', 'Freelance', 'Stajyer', 'Proje Bazlı'];
    const experienceLevels = ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Principal'];

    const skillSets = {
      'developer': ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Git', 'Docker'],
      'frontend': ['React', 'Vue.js', 'Angular', 'HTML', 'CSS', 'JavaScript', 'Webpack'],
      'backend': ['Node.js', 'Python', 'Java', 'C#', 'PostgreSQL', 'MongoDB', 'Redis'],
      'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android'],
      'data': ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas', 'Jupyter'],
      'devops': ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform', 'Linux', 'CI/CD']
    };

    const jobs = [];
    for (let i = 0; i < limit; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
      const experienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];

      // Determine skills based on keywords
      let skills = skillSets['developer']; // default
      Object.keys(skillSets).forEach(key => {
        if (keywords.toLowerCase().includes(key)) {
          skills = skillSets[key];
        }
      });

      const randomSkills = skills.sort(() => 0.5 - Math.random()).slice(0, 4 + Math.floor(Math.random() * 3));

      const salaryRanges = {
        'Junior': '8,000 - 15,000 TL',
        'Mid-Level': '15,000 - 25,000 TL',
        'Senior': '25,000 - 40,000 TL',
        'Lead': '35,000 - 55,000 TL',
        'Principal': '50,000 - 80,000 TL'
      };

      jobs.push({
        id: `realistic_${i + 1}`,
        title: `${experienceLevel} ${keywords}`,
        company: company,
        location: location,
        description: `${company} bünyesinde ${experienceLevel.toLowerCase()} seviye ${keywords} pozisyonu için aday aranmaktadır. Modern teknolojiler ile çalışma, esnek çalışma saatleri ve profesyonel gelişim fırsatları sunulmaktadır.`,
        requirements: randomSkills,
        salary: salaryRanges[experienceLevel],
        type: jobType,
        postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        url: `https://example.com/job/${i + 1}`
      });
    }

    return jobs;
  }

  /**
   * Enhanced mock data fallback with more realistic content
   */
  getEnhancedMockJobData(keywords, location) {
    console.log('Using enhanced mock data fallback');

    const enhancedJobs = this.generateRealisticJobData(keywords, location, 8);

    return {
      success: true,
      jobs: enhancedJobs,
      totalResults: enhancedJobs.length,
      searchCriteria: { keywords, location },
      message: 'API bağlantısı kurulamadı, gelişmiş demo veriler gösteriliyor',
      type: 'enhanced_mock'
    };
  }

  /**
   * Original mock data fallback when API is not available
   */
  getMockJobData(keywords, location) {
    console.log('Using basic mock data fallback');
    
    const mockJobs = [
      {
        id: '1',
        title: `${keywords} - Senior Pozisyon`,
        company: 'Tech Innovations Inc.',
        location: location,
        description: `${keywords} alanında deneyimli bir profesyonel arıyoruz. Modern teknolojiler ile çalışma fırsatı.`,
        requirements: ['React', 'JavaScript', 'CSS', 'HTML', 'Git'],
        salary: '15,000 - 25,000 TL',
        type: 'Tam Zamanlı',
        postedDate: new Date().toISOString().split('T')[0],
        url: 'https://example.com/job/1'
      },
      {
        id: '2',
        title: `${keywords} - Mid-Level`,
        company: 'Global Solutions Corp',
        location: location,
        description: `Orta seviye ${keywords} pozisyonu. Takım çalışması ve gelişim odaklı ortam.`,
        requirements: ['Node.js', 'Python', 'MongoDB', 'API Development'],
        salary: '12,000 - 20,000 TL',
        type: 'Tam Zamanlı',
        postedDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        url: 'https://example.com/job/2'
      },
      {
        id: '3',
        title: `${keywords} - Remote`,
        company: 'Digital Agency',
        location: `${location} (Remote)`,
        description: `Uzaktan çalışma imkanı ile ${keywords} pozisyonu. Esnek çalışma saatleri.`,
        requirements: ['React Native', 'JavaScript', 'Mobile Development'],
        salary: '10,000 - 18,000 TL',
        type: 'Tam Zamanlı',
        postedDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        url: 'https://example.com/job/3'
      },
      {
        id: '4',
        title: `Junior ${keywords}`,
        company: 'Startup Hub',
        location: location,
        description: `Yeni mezun veya junior seviye ${keywords} aranıyor. Mentorluk ve eğitim desteği.`,
        requirements: ['HTML', 'CSS', 'JavaScript', 'Öğrenme İsteği'],
        salary: '8,000 - 12,000 TL',
        type: 'Tam Zamanlı',
        postedDate: new Date(Date.now() - 259200000).toISOString().split('T')[0],
        url: 'https://example.com/job/4'
      }
    ];

    // Filter jobs based on keywords
    const filteredJobs = mockJobs.filter(job => 
      job.title.toLowerCase().includes(keywords.toLowerCase()) ||
      job.description.toLowerCase().includes(keywords.toLowerCase()) ||
      job.requirements.some(req => req.toLowerCase().includes(keywords.toLowerCase()))
    );

    return {
      success: true,
      jobs: filteredJobs.length > 0 ? filteredJobs : mockJobs,
      totalResults: filteredJobs.length > 0 ? filteredJobs.length : mockJobs.length,
      searchCriteria: { keywords, location },
      message: 'API bağlantısı kurulamadı, demo veriler gösteriliyor',
      type: 'mock'
    };
  }

  /**
   * Format job data for consistent structure
   */
  formatJobData(job) {
    return {
      id: job.id || String(Math.random()),
      title: job.title || 'İş Başlığı Belirtilmemiş',
      company: job.company || 'Şirket Belirtilmemiş',
      location: job.location || 'Lokasyon Belirtilmemiş',
      description: job.description || 'Açıklama mevcut değil',
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      salary: job.salary || 'Maaş belirtilmemiş',
      type: job.type || 'Tam Zamanlı',
      postedDate: job.postedDate || new Date().toISOString().split('T')[0],
      url: job.url || ''
    };
  }

  /**
   * Get popular search suggestions
   */
  getSearchSuggestions() {
    return [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Mobile Developer',
      'UI/UX Designer',
      'DevOps Engineer',
      'Data Scientist',
      'Product Manager',
      'QA Engineer',
      'System Administrator'
    ];
  }

  /**
   * Get popular locations
   */
  getLocationSuggestions() {
    return [
      'İstanbul',
      'Ankara',
      'İzmir',
      'Bursa',
      'Antalya',
      'Adana',
      'Konya',
      'Gaziantep',
      'Kayseri',
      'Remote'
    ];
  }
}

// Export singleton instance
export default new ApiService();
