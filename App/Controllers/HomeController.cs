using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Diagnostics;
using App.Services;
using App.Models;

namespace App.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IJobService _jobService;

    public HomeController(ILogger<HomeController> logger, IJobService jobService)
    {
        _logger = logger;
        _jobService = jobService;
    }

    public async Task<IActionResult> Index(string searchWord, int page = 1, int pageSize = 10)
    {
        IEnumerable<Job> jobs = await _jobService.GetAllJobsAsync();

        if (!string.IsNullOrEmpty(searchWord))
        {
            searchWord = searchWord.ToLower();
            jobs = jobs.Where(s => s.Title.ToLower().Contains(searchWord) 
                || s.Company.ToLower().Contains(searchWord) 
                || s.Location.ToLower().Contains(searchWord) 
                || s.Status.ToString().ToLower().Contains(searchWord));
        }
        var orderedJobs = jobs.OrderByDescending(j => j.CreatedAt);
        int totalPages;
        var paginatedJobs = PaginateJobs(orderedJobs, page, pageSize, out totalPages).ToList();

        ViewData["CurrentPage"] = page;
        ViewData["TotalPages"] = totalPages;
        ViewData["PageSize"] = pageSize;
        ViewData["SearchWord"] = searchWord;

        return View(paginatedJobs);
    }

    private IEnumerable<Job> PaginateJobs(IEnumerable<Job> jobs, int page, int pageSize, out int totalPages)
    {
        int totalItems = jobs.Count();
        totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        return jobs
            .Skip((page - 1) * pageSize)
            .Take(pageSize);
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
