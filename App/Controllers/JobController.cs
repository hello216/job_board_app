using System;
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using App.Models;
using App.Data;

namespace App.Controllers;

public class JobController : Controller
{
    private readonly ILogger<JobController> _logger;
    private readonly AppDbContext _context;
    public JobController(ILogger<JobController> logger, AppDbContext context)
    {
        _logger = logger;
        _context = context;
    }
    
    public IActionResult Create()
    {
        return View();
    }
    
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Status,Title,Company,Url,Location")] Job job)
    {
        if (ModelState.IsValid)
        {
            try
            {
                _context.Add(job);
                await _context.SaveChangesAsync();
                TempData["SuccessMessage"] = "Job application added!";
                return RedirectToAction("Index", "Home");
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Failed to create job due to Id collision");

                job.Id = Guid.NewGuid().ToString().Substring(0, 12);
                try
                {
                    _context.Add(job);
                    await _context.SaveChangesAsync();
                    TempData["SuccessMessage"] = "Job application added!";
                    return RedirectToAction("Index", "Home");
                }
                catch (DbUpdateException)
                {
                    ModelState.AddModelError("", "Unable to save the job. Please try again.");
                }
            }
        }
        return View(job);
    }
    
    public async Task<IActionResult> Edit(string id)
    {
        var job = await _context.Jobs.FirstOrDefaultAsync(m => m.Id == id);
        if (job == null)
        {
            return NotFound();
        }
        return View(job);
    }
}
