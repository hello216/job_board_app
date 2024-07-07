using NUnit.Framework;
using App.Services;
using App.Models;
using App.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace App.UnitTests.Services
{
    [TestFixture]
    public class JobServiceTests
    {
        private AppDbContext _context;
        private IJobService _jobService;

        [SetUp]
        public void SetUp()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _context = new AppDbContext(options);
            _jobService = new JobService(_context);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public async Task GetAllJobsAsync_ShouldReturnAllJobs()
        {
            // Arrange
            await _context.Jobs.AddRangeAsync(
                new Job { Id = "1", Title = "Job 1" },
                new Job { Id = "2", Title = "Job 2" }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = await _jobService.GetAllJobsAsync();

            // Assert
            Assert.That(result.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task CreateJobAsync_ShouldAddJobAndReturnIt()
        {
            // Arrange
            var job = new Job { Id = "1", Title = "New Job" };

            // Act
            var result = await _jobService.CreateJobAsync(job);

            // Assert
            Assert.That(result, Is.EqualTo(job));
            Assert.That(_context.Jobs.Count(), Is.EqualTo(1));
        }

        [Test]
        public async Task GetJobByIdAsync_ShouldReturnJob()
        {
            // Arrange
            var job = new Job { Id = "1", Title = "Test Job" };
            await _context.Jobs.AddAsync(job);
            await _context.SaveChangesAsync();

            // Act
            var result = await _jobService.GetJobByIdAsync("1");

            // Assert
            Assert.That(result, Is.EqualTo(job));
        }

        [Test]
        public async Task UpdateJobAsync_ShouldUpdateJob()
        {
            // Arrange
            var job = new Job { Id = "1", Title = "Original Job" };
            await _context.Jobs.AddAsync(job);
            await _context.SaveChangesAsync();

            job.Title = "Updated Job";

            // Act
            await _jobService.UpdateJobAsync(job);

            // Assert
            var updatedJob = await _context.Jobs.FindAsync("1");
            Assert.That(updatedJob.Title, Is.EqualTo("Updated Job"));
        }

        [Test]
        public async Task DeleteJobAsync_ShouldRemoveJob()
        {
            // Arrange
            var job = new Job { Id = "1", Title = "Job to Delete" };
            await _context.Jobs.AddAsync(job);
            await _context.SaveChangesAsync();

            // Act
            await _jobService.DeleteJobAsync("1");

            // Assert
            var deletedJob = await _context.Jobs.FindAsync("1");
            Assert.That(deletedJob, Is.Null);
        }

        [Test]
        public async Task JobExistsAsync_ShouldReturnTrueForExistingJob()
        {
            // Arrange
            var job = new Job { Id = "1", Title = "Existing Job" };
            await _context.Jobs.AddAsync(job);
            await _context.SaveChangesAsync();

            // Act
            var result = await _jobService.JobExistsAsync("1");

            // Assert
            Assert.That(result, Is.True);
        }

        [Test]
        public async Task JobExistsAsync_ShouldReturnFalseForNonExistingJob()
        {
            // Act
            var result = await _jobService.JobExistsAsync("999");

            // Assert
            Assert.That(result, Is.False);
        }
    }
}
