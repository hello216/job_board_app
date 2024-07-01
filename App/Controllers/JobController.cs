using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using App.Models;

namespace App.Controllers;

public class JobController : Controller
{
    private readonly ILogger<JobController> _logger;

    public JobController(ILogger<JobController> logger)
    {
        _logger = logger;
    }
    
    public IActionResult Create()
    {
        return View();
    }
}
