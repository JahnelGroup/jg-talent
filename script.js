document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://script.google.com/macros/s/AKfycbzSZOHpJ1T2P9PONkzGutooBd0k_tWEY_2Jw1IBDqoYQ_dnpBIO-STtCvV8cf_uh-Wr/exec"; // Replace with your actual endpoint
    const profileContainer = document.getElementById("profileContainer");
    const searchBar = document.getElementById("searchBar");
    let profiles = []; // To store the fetched data
  
    // Fetch profiles from API
    fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        profiles = data.data; // Adjust this based on your API response
        renderProfiles(profiles);
      })
      .catch(error => console.error("Error fetching profiles:", error));
  
    // Render profiles dynamically
    function renderProfiles(profileList) {
      profileContainer.innerHTML = ""; // Clear previous profiles
      profileList.forEach(profile => {
        const profileCard = document.createElement("div");
        profileCard.className = "col-md-4 mb-3";
        profileCard.innerHTML = `
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">${profile.Name}</h5>
              <p class="card-text"><strong>Role:</strong> ${profile.Role}</p>
              <p class="card-text"><strong>Years:</strong> ${profile.Years}</p>
              <p class="card-text"><strong>Skills:</strong> ${profile.Tags}</p>
              <a href="${profile.ProfileUrl}" target="_blank" class="btn btn-primary">View Profile</a>
            </div>
          </div>
        `;
        profileContainer.appendChild(profileCard);
      });
    }
  
    // Search bar event listener
    searchBar.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredProfiles = profiles.filter(profile =>
        profile.Name.toLowerCase().includes(searchTerm) ||
        profile.Role.toLowerCase().includes(searchTerm) ||
        profile.Tags.toLowerCase().includes(searchTerm)
      );
      renderProfiles(filteredProfiles);
    });
  });
  