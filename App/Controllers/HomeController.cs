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

    public async Task<IActionResult> Index()
    {
        var jobs = await _jobService.GetAllJobsAsync();
        var orderedJobs = jobs.OrderByDescending(j => j.CreatedAt).ToList();
        return View(orderedJobs);
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
