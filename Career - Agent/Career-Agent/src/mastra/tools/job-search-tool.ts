import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: string;
  postedDate: string;
  url?: string;
}

interface CareerAPIConfig {
  baseURL: string;
  timeout: number;
  retryCount: number;
}

export const jobSearchTool = createTool({
  id: 'search-jobs',
  description: 'Search for job listings based on criteria',
  inputSchema: z.object({
    query: z.string().describe('Job title or keywords'),
    location: z.string().optional().describe('Job location (city, country)'),
    company: z.string().optional().describe('Company name'),
    jobType: z.string().optional().describe('Job type (full-time, part-time, contract)'),
    experienceLevel: z.string().optional().describe('Experience level (entry, mid, senior)'),
    limit: z.number().optional().default(10).describe('Number of results to return'),
  }),
  outputSchema: z.object({
    jobs: z.array(z.object({
      id: z.string(),
      title: z.string(),
      company: z.string(),
      location: z.string(),
      description: z.string(),
      requirements: z.array(z.string()),
      salary: z.string().optional(),
      type: z.string(),
      postedDate: z.string(),
      url: z.string().optional(),
    })),
    totalResults: z.number(),
    searchCriteria: z.object({
      query: z.string(),
      location: z.string().optional(),
      company: z.string().optional(),
    }),
  }),
  execute: async ({ context }) => {
    return await searchJobs(context);
  },
});

const searchJobs = async (searchParams: any) => {
  try {
    // Career API konfigürasyonu
    const config: CareerAPIConfig = {
      baseURL: getCareerAPIBaseURL(),
      timeout: 10000,
      retryCount: 2
    };

    console.log('Searching jobs with Career API:', config.baseURL);

    // İş arama parametrelerini hazırla
    const apiSearchParams = {
      keywords: searchParams.query || 'software developer',
      location: searchParams.location || 'Türkiye',
      locale: 'tr_TR',
      sort: 'relevance',
      pagesize: searchParams.limit || 10,
      ...(searchParams.company && { company: searchParams.company }),
      ...(searchParams.jobType && { contracttype: searchParams.jobType }),
      ...(searchParams.experienceLevel && { experience_level: searchParams.experienceLevel })
    };

    // Career API'sine istek gönder
    const result = await makeCareerAPIRequest('/api/jobs/search', apiSearchParams, config);

    if (result.success) {
      // Sonuçları standart formata dönüştür
      const jobs: JobListing[] = (result.jobs || []).map((job: any, index: number) => ({
        id: job.id || `job_${index}`,
        title: job.title || 'Unknown Position',
        company: job.company || 'Unknown Company',
        location: job.location || searchParams.location || 'Unknown Location',
        description: job.description || 'No description available',
        requirements: job.requirements || [],
        salary: job.salary || undefined,
        type: job.type || searchParams.jobType || 'full-time',
        postedDate: job.postedDate || new Date().toISOString().split('T')[0],
        url: job.url || undefined
      }));

      return {
        jobs,
        totalResults: result.totalResults || jobs.length,
        searchCriteria: {
          query: searchParams.query,
          location: searchParams.location,
          company: searchParams.company,
        },
        message: result.message,
        type: result.type
      };
    } else {
      throw new Error(result.message || 'Job search failed');
    }

  } catch (error) {
    console.error('Error searching jobs via Career API:', error);

    // Fallback: Gerçekçi mock data döndür
    const fallbackJobs: JobListing[] = [
      {
        id: 'fallback_1',
        title: `${searchParams.query || 'Software Developer'} - Senior Pozisyon`,
        company: 'Tech Innovations A.Ş.',
        location: searchParams.location || 'İstanbul',
        description: `${searchParams.query || 'Software Developer'} alanında deneyimli bir profesyonel arıyoruz. Modern teknolojiler ile çalışma fırsatı, esnek çalışma saatleri ve rekabetçi maaş imkanı.`,
        requirements: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Git', '3+ yıl deneyim'],
        salary: '15,000 - 25,000 TL',
        type: searchParams.jobType || 'Tam Zamanlı',
        postedDate: new Date().toISOString().split('T')[0],
        url: 'https://example.com/job/1'
      },
      {
        id: 'fallback_2',
        title: `Junior ${searchParams.query || 'Developer'}`,
        company: 'Startup Hub Ltd.',
        location: searchParams.location || 'Ankara',
        description: `Yeni mezun veya junior seviye ${searchParams.query || 'developer'} aranıyor. Mentorluk ve eğitim desteği ile kariyer gelişimi fırsatı.`,
        requirements: ['HTML', 'CSS', 'JavaScript', 'Öğrenme İsteği', 'Takım Çalışması'],
        salary: '8,000 - 12,000 TL',
        type: searchParams.jobType || 'Tam Zamanlı',
        postedDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        url: 'https://example.com/job/2'
      },
      {
        id: 'fallback_3',
        title: `${searchParams.query || 'Developer'} - Remote`,
        company: 'Digital Solutions',
        location: `${searchParams.location || 'Türkiye'} (Remote)`,
        description: `Uzaktan çalışma imkanı ile ${searchParams.query || 'developer'} pozisyonu. Esnek çalışma saatleri ve global projeler.`,
        requirements: ['React Native', 'API Integration', 'Git', 'Remote Work Experience'],
        salary: '12,000 - 20,000 TL',
        type: searchParams.jobType || 'Tam Zamanlı',
        postedDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        url: 'https://example.com/job/3'
      }
    ];

    return {
      jobs: fallbackJobs,
      totalResults: fallbackJobs.length,
      searchCriteria: {
        query: searchParams.query,
        location: searchParams.location,
        company: searchParams.company,
      },
      message: `API bağlantısı kurulamadı (${error.message}). Demo veriler gösteriliyor.`,
      type: 'fallback'
    };
  }
};

// Career API base URL'ini belirle
function getCareerAPIBaseURL(): string {
  // Öncelik sırası: Android emulator -> Host machine IP -> Localhost
  const possibleURLs = [
    'http://10.0.2.2:5000',      // Android emulator
    'http://192.168.59.150:5000', // Host machine IP
    'http://localhost:5000'       // Localhost fallback
  ];

  // İlk URL'i döndür (gerçek uygulamada connectivity test yapılabilir)
  return possibleURLs[1]; // Host machine IP'sini varsayılan olarak kullan
}

// Career API'sine HTTP isteği gönder
async function makeCareerAPIRequest(endpoint: string, params: any, config: CareerAPIConfig): Promise<any> {
  const url = `${config.baseURL}${endpoint}`;

  try {
    // Fetch API kullanarak istek gönder
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(config.timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error(`Career API request failed: ${error.message}`);
    throw error;
  }
}
