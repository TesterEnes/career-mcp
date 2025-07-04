import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const jobSearchResultSchema = z.object({
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
});

const searchJobs = createStep({
  id: 'search-jobs',
  description: 'Searches for job listings based on criteria',
  inputSchema: z.object({
    query: z.string().describe('Job title or keywords to search for'),
    location: z.string().optional().describe('Job location'),
    company: z.string().optional().describe('Company name'),
    jobType: z.string().optional().describe('Job type (full-time, part-time, contract)'),
    limit: z.number().optional().default(5).describe('Number of results to return'),
  }),
  outputSchema: jobSearchResultSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    // Gerçek Career API entegrasyonu - job-search-tool'u kullan
    try {
      // Import job search tool
      const { jobSearchTool } = await import('../tools/job-search-tool.js');

      // Execute the job search tool with input data
      const searchResult = await jobSearchTool.execute({
        context: {
          query: inputData.query,
          location: inputData.location,
          company: inputData.company,
          jobType: inputData.jobType,
          limit: inputData.limit
        }
      });

      if (searchResult && searchResult.jobs) {
        return searchResult;
      } else {
        throw new Error('No results from job search tool');
      }
    } catch (error) {
      console.error('Job search tool failed, using fallback data:', error);

      // Fallback to enhanced mock data
      const jobs = [
        {
          id: 'workflow_fallback_1',
          title: `${inputData.query || 'Software Developer'} - Senior Pozisyon`,
          company: 'Tech Innovations (Workflow)',
          location: inputData.location || 'İstanbul',
          description: `${inputData.query || 'Software Developer'} alanında deneyimli profesyonel aranıyor. Workflow entegrasyonu ile bulunan pozisyon.`,
          requirements: [
            'Modern teknolojiler ile deneyim',
            'Güçlü problem çözme yetenekleri',
            'Takım çalışması becerileri',
            'API entegrasyonu deneyimi'
          ],
          salary: '20,000 - 35,000 TL',
          type: inputData.jobType || 'Tam Zamanlı',
          postedDate: new Date().toISOString().split('T')[0],
          url: 'https://example.com/workflow-job/1'
        },
        {
          id: 'workflow_fallback_2',
          title: `Junior ${inputData.query || 'Developer'}`,
          company: 'Startup Hub (Workflow)',
          location: inputData.location || 'Ankara',
          description: `Yeni mezun ${inputData.query || 'developer'} aranıyor. Workflow sistemi ile tespit edilen fırsat.`,
          requirements: [
            'Temel programlama bilgisi',
            'Öğrenme isteği',
            'Takım çalışması',
            'Workflow araçları ile deneyim'
          ],
          salary: '10,000 - 18,000 TL',
          type: inputData.jobType || 'Tam Zamanlı',
          postedDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          url: 'https://example.com/workflow-job/2'
        }
      ];

      return {
        jobs,
        totalResults: jobs.length,
        searchCriteria: {
          query: inputData.query,
          location: inputData.location,
          company: inputData.company,
        },
        message: 'Workflow fallback data kullanıldı',
        type: 'workflow_fallback'
      };
    }
  },
});

const analyzeJobs = createStep({
  id: 'analyze-jobs',
  description: 'Analyzes job listings and provides insights',
  inputSchema: jobSearchResultSchema,
  outputSchema: z.object({
    analysis: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const jobResults = inputData;

    if (!jobResults) {
      throw new Error('Job search results not found');
    }

    const agent = mastra?.getAgent('jobAgent');
    if (!agent) {
      throw new Error('Job agent not found');
    }

    const prompt = `Based on the following job search results, provide a comprehensive analysis:
      ${JSON.stringify(jobResults, null, 2)}
      
      Please structure your response as follows:

      🔍 JOB SEARCH SUMMARY
      ═══════════════════════════
      • Search Query: ${jobResults.searchCriteria.query}
      • Location: ${jobResults.searchCriteria.location || 'Not specified'}
      • Total Results: ${jobResults.totalResults}

      📊 MARKET ANALYSIS
      ═══════════════════════════
      • Salary Range Analysis
      • Common Requirements
      • Job Types Distribution
      • Location Trends

      💼 TOP OPPORTUNITIES
      ═══════════════════════════
      [For each job, provide:]
      • Company: [Company Name]
      • Position: [Job Title]
      • Location: [Location]
      • Salary: [Salary Range]
      • Key Requirements: [Top 3-4 requirements]
      • Match Score: [How well it matches the search criteria]

      🎯 RECOMMENDATIONS
      ═══════════════════════════
      • Skills to Highlight
      • Application Tips
      • Market Positioning Advice
      • Next Steps

      ⚠️ IMPORTANT CONSIDERATIONS
      ═══════════════════════════
      • Market Competition Level
      • Skill Gaps to Address
      • Industry Trends

      Keep the analysis professional, actionable, and focused on helping the job seeker make informed decisions.`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let analysisText = '';

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      analysisText += chunk;
    }

    return {
      analysis: analysisText,
    };
  },
});

const jobSearchWorkflow = createWorkflow({
  id: 'job-search-workflow',
  inputSchema: z.object({
    query: z.string().describe('Job title or keywords to search for'),
    location: z.string().optional().describe('Job location'),
    company: z.string().optional().describe('Company name'),
    jobType: z.string().optional().describe('Job type (full-time, part-time, contract)'),
    limit: z.number().optional().default(5).describe('Number of results to return'),
  }),
  outputSchema: z.object({
    analysis: z.string(),
  }),
})
  .then(searchJobs)
  .then(analyzeJobs);

jobSearchWorkflow.commit();

export { jobSearchWorkflow };
