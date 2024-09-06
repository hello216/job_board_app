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

    public async Task<IActionResult> Index(string? searchWord)
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

        var orderedJobs = jobs.OrderByDescending(j => j.CreatedAt).ToList();
        return View(orderedJobs);
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
