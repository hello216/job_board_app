using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using App.Services;
using App.Models;
using System;

namespace App.Controllers;

public class JobController : Controller
{
    private readonly ILogger<JobController> _logger;
    private readonly IJobService _jobService;

    public JobController(ILogger<JobController> logger, IJobService jobService)
    {
        _logger = logger;
        _jobService = jobService;
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
                await _jobService.CreateJobAsync(job);
                TempData["SuccessMessage"] = "Job application added!";
                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create job");
                ModelState.AddModelError("", "Unable to save the job. Please try again.");
            }
        }
        return View(job);
    }

    public async Task<IActionResult> Edit(string id)
    {
        var job = await _jobService.GetJobByIdAsync(id);
        if (job == null)
        {
            return NotFound();
        }
        return View(job);
    }

    public async Task<IActionResult> EditNotes(string id)
    {
        var job = await _jobService.GetJobByIdAsync(id);
        if (job == null)
        {
            return NotFound();
        }
        return View(job);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditNotes(string id, [Bind("Id, Note")] Job job)
    {
        if (id != job.Id)
        {
            return NotFound();
        }

        if (ModelState.IsValid)
        {
            try
            {
                await _jobService.UpdateJobAsync(job);
                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update job");
                if (!await _jobService.JobExistsAsync(job.Id))
                {
                    return NotFound();
                }
                else
                {
                    ModelState.AddModelError("", "Unable to save changes. Please try again.");
                }
            }
        }
        return View(job); 
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(string id, [Bind("Id,Status,Title,Company,Url,Location")] Job job)
    {
        if (id != job.Id)
        {
            return NotFound();
        }

        if (ModelState.IsValid)
        {
            try
            {
                await _jobService.UpdateJobAsync(job);
                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update job");
                if (!await _jobService.JobExistsAsync(job.Id))
                {
                    return NotFound();
                }
                else
                {
                    ModelState.AddModelError("", "Unable to save changes. Please try again.");
                }
            }
        }
        return View(job);
    }

    public async Task<IActionResult> Delete(string id)
    {
        var job = await _jobService.GetJobByIdAsync(id);
        if (job == null)
        {
            return NotFound();
        }
        return View(job);
    }

    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(string id)
    {   
        try
        {
            await _jobService.DeleteJobAsync(id);
            TempData["SuccessMessage"] = "Job application deleted";
            return RedirectToAction("Index", "Home");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete job");
            return NotFound();
        }
    }
}
