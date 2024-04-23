document.addEventListener('DOMContentLoaded', () => {
  const getDataButton = document.getElementById('get-data');
  const dataContainer = document.getElementById('data-container');

  getDataButton.addEventListener('click', () => {
    fetchData()
      .then(data => {
        displayData(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  });

  async function fetchData() {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  }

  function displayData(data) {
    dataContainer.innerHTML = '';
    data.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.textContent = JSON.stringify(item);
      dataContainer.appendChild(itemElement);
    });
  }
});
