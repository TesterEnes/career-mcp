from mcp.server.fastmcp import FastMCP
from app import search_jobs, get_job_details
from typing import Optional

# Initialize MCP server
mcp = FastMCP("careerjet-job-search-mcp")

@mcp.tool()
async def search_jobs_tool(
    keywords: str,
    location: str,
    locale: str = "en_US",
    affid: str = "213e213hd12344552",
    user_ip: str = "127.0.0.1",
    user_agent: str = "Mozilla/5.0 (compatible; MCP-CareerjetBot/1.0)",
    url: str = "http://example.com/jobsearch",
    sort: Optional[str] = None,
    start_num: Optional[int] = None,
    pagesize: Optional[int] = None,
    page: Optional[int] = None,
    contracttype: Optional[str] = None,
    contractperiod: Optional[str] = None
) -> dict:
    """
    Search for jobs using Careerjet API.

    Args:
        keywords: Keywords to match job titles, content or company names
        location: Location of requested jobs (e.g., "London", "New York", "Berlin")
        locale: Locale code (default: en_US). Examples: en_GB, en_US, de_DE, fr_FR
        affid: Affiliate ID provided by Careerjet (required)
        user_ip: IP address of the end-user
        user_agent: User agent of the end-user's browser
        url: URL of page that will display the search results
        sort: Sort type - 'relevance' (default), 'date', or 'salary'
        start_num: Position of returned job postings (>= 1)
        pagesize: Number of jobs returned in one call
        page: Page number of returned jobs (>= 1)
        contracttype: Contract type - 'p' (permanent), 'c' (contract), 't' (temporary), 'i' (training), 'v' (voluntary)
        contractperiod: Contract period - 'f' (full time), 'p' (part time)

    Returns:
        dict: Search results from Careerjet API including job listings
    """
    # Prepare optional parameters
    optional_params = {}
    if sort: optional_params['sort'] = sort
    if start_num: optional_params['start_num'] = start_num
    if pagesize: optional_params['pagesize'] = pagesize
    if page: optional_params['page'] = page
    if contracttype: optional_params['contracttype'] = contracttype
    if contractperiod: optional_params['contractperiod'] = contractperiod

    # Call the function from app.py
    result = search_jobs(
        keywords=keywords,
        location=location,
        locale=locale,
        affid=affid,
        user_ip=user_ip,
        user_agent=user_agent,
        url=url,
        **optional_params
    )
    return result

@mcp.tool()
async def get_job_details_tool(job_url: str, locale: str = "en_US") -> dict:
    """
    Get detailed information about a specific job.

    Args:
        job_url: URL of the job posting
        locale: Locale code (default: en_US)

    Returns:
        dict: Job details or information about implementation
    """
    result = get_job_details(job_url, locale)
    return result

if __name__ == "__main__":
    mcp.run(transport="stdio")