def search_jobs(keywords, location, locale="en_US", affid="213e213hd12344552", user_ip="127.0.0.1", user_agent="Mozilla/5.0", url="http://example.com", **kwargs):
    """
    Search for jobs using Careerjet API.

    Args:
        keywords (str): Keywords to match job titles, content or company names
        location (str): Location of requested jobs
        locale (str): Locale code (default: en_US)
        affid (str): Affiliate ID (required by Careerjet)
        user_ip (str): IP address of the end-user
        user_agent (str): User agent of the end-user's browser
        url (str): URL of page that will display the search results
        **kwargs: Additional search parameters (sort, start_num, pagesize, etc.)

    Returns:
        dict: Search results from Careerjet API
    """
    try:
        # First try the official client
        try:
            from careerjet_api_client import CareerjetAPIClient

            # Initialize Careerjet API client
            cj = CareerjetAPIClient(locale)

            # Prepare search parameters
            search_params = {
                'keywords': keywords,
                'location': location,
                'affid': affid,
                'user_ip': user_ip,
                'user_agent': user_agent,
                'url': url
            }

            # Add optional parameters
            for key, value in kwargs.items():
                if key in ['sort', 'start_num', 'pagesize', 'page', 'contracttype', 'contractperiod']:
                    search_params[key] = value

            # Perform search
            result = cj.search(search_params)
            return result

        except Exception as client_error:
            # Fallback to direct HTTP API call
            return search_jobs_direct_api(keywords, location, locale, affid, user_ip, user_agent, url, **kwargs)

    except Exception as e:
        return {"error": f"Failed to search jobs: {str(e)}"}


def search_jobs_direct_api(keywords, location, locale="en_US", affid="213e213hd12344552", user_ip="127.0.0.1", user_agent="Mozilla/5.0", url="http://example.com", **kwargs):
    """
    Direct HTTP API call to Careerjet as fallback.
    """
    import requests

    # Use the official API endpoint
    api_url = "https://api.careerjet.com/jobs"

    # Prepare parameters for the API
    params = {
        'keywords': keywords,
        'location': location,
        'apikey': affid,  # Use affid as API key
    }

    # Add optional parameters
    for key, value in kwargs.items():
        if key in ['contracttype', 'salary', 'page'] and value is not None:
            params[key] = value

    try:
        # Make API request
        headers = {
            'User-Agent': user_agent,
            'Accept': 'application/json'
        }

        response = requests.get(api_url, params=params, headers=headers, timeout=10)

        if response.status_code == 200:
            try:
                return response.json()
            except ValueError:
                # If JSON parsing fails, return the text response
                return {
                    "error": "Invalid JSON response",
                    "raw_response": response.text[:500]
                }
        elif response.status_code == 401:
            return {
                "error": "Authentication failed - Invalid API key",
                "message": "You need a valid Careerjet API key. Get one from https://www.careerjet.com/partners/api/",
                "status_code": 401
            }
        else:
            return {
                "error": f"API request failed with status {response.status_code}",
                "message": response.text[:200] if response.text else "No response content",
                "url": response.url
            }

    except requests.exceptions.RequestException as e:
        # If API fails, provide a demo response for testing
        return create_demo_response(keywords, location)


def create_demo_response(keywords, location):
    """
    Create an enhanced demo response for testing when API is not available.
    """
    import random
    from datetime import datetime, timedelta

    # Enhanced company list
    companies = [
        "Tech Innovations A.Ş.", "Dijital Çözümler Ltd.", "Yazılım Geliştirme A.Ş.",
        "Teknoloji Merkezi", "İnovasyon Hub", "Startup Accelerator",
        "Global Tech Solutions", "Akıllı Sistemler A.Ş.", "Veri Analitik Ltd.",
        "Mobil Uygulama Stüdyosu", "E-Ticaret Platformu", "Fintech Startup",
        "Bulut Teknolojileri A.Ş.", "AI Research Lab", "Blockchain Solutions"
    ]

    # Job types and experience levels
    job_types = ["Senior", "Mid-Level", "Junior", "Lead", "Principal"]
    work_types = ["Tam Zamanlı", "Yarı Zamanlı", "Freelance", "Remote", "Hibrit"]

    # Skill sets based on keywords
    skill_sets = {
        "developer": ["React", "JavaScript", "TypeScript", "Node.js", "Python", "Git", "Docker"],
        "frontend": ["React", "Vue.js", "Angular", "HTML", "CSS", "JavaScript", "Webpack"],
        "backend": ["Node.js", "Python", "Java", "C#", "PostgreSQL", "MongoDB", "Redis"],
        "mobile": ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android"],
        "data": ["Python", "R", "SQL", "Machine Learning", "TensorFlow", "Pandas"],
        "devops": ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform", "Linux"]
    }

    # Determine relevant skills
    relevant_skills = skill_sets.get("developer", ["Programming", "Problem Solving"])
    for key in skill_sets:
        if key.lower() in keywords.lower():
            relevant_skills = skill_sets[key]
            break

    # Generate multiple job listings
    jobs = []
    for i in range(6):  # Generate 6 jobs
        job_type = random.choice(job_types)
        company = random.choice(companies)
        work_type = random.choice(work_types)

        # Salary ranges based on experience level
        salary_ranges = {
            "Junior": "8,000 - 15,000 TL",
            "Mid-Level": "15,000 - 25,000 TL",
            "Senior": "25,000 - 40,000 TL",
            "Lead": "35,000 - 55,000 TL",
            "Principal": "50,000 - 80,000 TL"
        }

        # Random skills selection
        job_skills = random.sample(relevant_skills, min(4, len(relevant_skills)))

        # Generate posting date (within last 7 days)
        days_ago = random.randint(0, 7)
        post_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")

        job = {
            "id": f"demo_job_{i+1}",
            "title": f"{job_type} {keywords}",
            "company": company,
            "location": location if work_type != "Remote" else f"{location} (Remote)",
            "salary": salary_ranges.get(job_type, "Rekabetçi maaş"),
            "description": f"{company} bünyesinde {job_type.lower()} seviye {keywords} pozisyonu için aday aranmaktadır. Modern teknolojiler ile çalışma, esnek çalışma saatleri ve profesyonel gelişim fırsatları sunulmaktadır.",
            "requirements": job_skills,
            "type": work_type,
            "url": f"https://example.com/job/{i+1}",
            "date": post_date,
            "posted_date": post_date
        }
        jobs.append(job)

    return {
        "type": "demo",
        "message": "Bu gelişmiş demo yanıttır. Gerçek Careerjet API'si için geçerli bir API key gereklidir.",
        "search_params": {
            "keywords": keywords,
            "location": location
        },
        "jobs": jobs,
        "total_jobs": len(jobs),
        "note": "Gerçek iş ilanları için https://www.careerjet.com/partners/api/ adresinden API key alın.",
        "enhanced": True
    }


def get_job_details(job_url, locale="en_US"):
    """
    Get detailed information about a specific job.

    Args:
        job_url (str): URL of the job posting
        locale (str): Locale code (default: en_US)

    Returns:
        dict: Job details or error message
    """
    try:
        import requests

        # Simple job details extraction (basic implementation)
        # In a real scenario, you might want to scrape the job page or use additional APIs
        return {
            "job_url": job_url,
            "message": "Job details retrieval would require additional implementation",
            "suggestion": "Use the search_jobs function to get job listings with basic details"
        }

    except Exception as e:
        return {"error": f"Failed to get job details: {str(e)}"}
