document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://script.google.com/macros/s/AKfycbzSZOHpJ1T2P9PONkzGutooBd0k_tWEY_2Jw1IBDqoYQ_dnpBIO-STtCvV8cf_uh-Wr/exec";
  const profileContainer = document.getElementById("profileContainer");
  const searchBar = document.getElementById("searchBar");
  const selectedFilters = document.getElementById("selectedFilters");
  const viewAllTalents = document.getElementById("viewAllTalents");
  
  let profiles = [];
  let activeFilters = {
    role: [],
    skills: [],
    location: []
  };

  // Initialize dropdowns
  const dropdowns = {
    role: document.getElementById("roleDropdown"),
    skills: document.getElementById("skillsDropdown"),
    location: document.getElementById("locationDropdown")
  };

  const filterButtons = {
    role: document.getElementById("roleFilter"),
    skills: document.getElementById("skillsFilter"),
    location: document.getElementById("locationFilter")
  };

  // Toggle dropdown visibility
  Object.entries(filterButtons).forEach(([key, button]) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAllDropdowns();
      dropdowns[key].classList.toggle("show");
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest('.dropdown') && !e.target.matches(".btn-filter")) {
      closeAllDropdowns();
    }
  });

  function closeAllDropdowns() {
    Object.values(dropdowns).forEach(dropdown => {
      dropdown.classList.remove("show");
    });
  }

  // Fetch and initialize data
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      profiles = data.data;
      initializeFilters();
      renderProfiles(profiles);
    })
    .catch(error => console.error("Error fetching profiles:", error));

  function initializeFilters() {
    const uniqueValues = {
      role: [...new Set(profiles.map(p => p.Role))].sort(),
      skills: [...new Set(profiles.flatMap(p => p.Tags.split(",").map(s => s.trim())))].sort(),
      location: [...new Set(profiles.map(p => p.Location))].sort()
    };

    // Populate dropdowns
    Object.entries(uniqueValues).forEach(([key, values]) => {
      const dropdown = dropdowns[key];
      dropdown.innerHTML = values
        .map(value => `
          <div class="dropdown-item ${activeFilters[key].includes(value) ? 'selected' : ''}" data-type="${key}" data-value="${value.trim()}">
            <div class="checkbox-wrapper">
              <div class="custom-checkbox"></div>
            </div>
            ${value.trim()}
          </div>
        `)
        .join("");
    });

    // Update dropdown click handlers
    Object.values(dropdowns).forEach(dropdown => {
      dropdown.addEventListener("click", (e) => {
        const item = e.target.closest('.dropdown-item');
        if (item) {
          const { type, value } = item.dataset;
          toggleFilter(type, value, item);
          e.stopPropagation(); // Prevent dropdown from closing
        }
      });
    });
  }

  function toggleFilter(type, value, item) {
    if (activeFilters[type].includes(value)) {
      removeFilter(type, value);
      item.classList.remove('selected');
    } else {
      addFilter(type, value);
      item.classList.add('selected');
    }
  }

  function addFilter(type, value) {
    if (!activeFilters[type].includes(value)) {
      activeFilters[type].push(value);
      renderFilterPills();
      applyFilters();
    }
  }

  function removeFilter(type, value) {
    activeFilters[type] = activeFilters[type].filter(v => v !== value);
    // Uncheck the corresponding checkbox
    const dropdown = dropdowns[type];
    const item = dropdown.querySelector(`[data-value="${value}"]`);
    if (item) {
      item.classList.remove('selected');
    }
    renderFilterPills();
    applyFilters();
  }

  function renderFilterPills() {
    selectedFilters.innerHTML = Object.entries(activeFilters)
      .flatMap(([type, values]) =>
        values.map(value => `
          <div class="filter-pill">
            ${value}
            <span class="remove" data-type="${type}" data-value="${value}">×</span>
          </div>
        `)
      )
      .join("");

    // Add click handlers for remove buttons
    document.querySelectorAll(".filter-pill .remove").forEach(button => {
      button.addEventListener("click", (e) => {
        const { type, value } = e.target.dataset;
        removeFilter(type, value);
      });
    });

    // Show/hide "View All Talents" button
    const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);
    viewAllTalents.style.display = hasActiveFilters ? "block" : "none";
  }

  function applyFilters() {
    const searchTerm = searchBar.value.toLowerCase();
    let filteredProfiles = profiles;

    // Apply search term filter
    if (searchTerm) {
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.Name.toLowerCase().includes(searchTerm) ||
        profile.Role.toLowerCase().includes(searchTerm) ||
        profile.Tags.toLowerCase().includes(searchTerm)
      );
    }

    // Apply active filters (AND condition between different filter types)
    if (activeFilters.role.length > 0) {
      filteredProfiles = filteredProfiles.filter(profile =>
        activeFilters.role.includes(profile.Role)
      );
    }

    if (activeFilters.skills.length > 0) {
      filteredProfiles = filteredProfiles.filter(profile => {
        const profileSkills = profile.Tags.split(",").map(s => s.trim());
        return activeFilters.skills.every(skill => profileSkills.includes(skill));
      });
    }

    if (activeFilters.location.length > 0) {
      filteredProfiles = filteredProfiles.filter(profile =>
        activeFilters.location.includes(profile.Location)
      );
    }

    renderProfiles(filteredProfiles);
  }

  // Render profiles
  function renderProfiles(profileList) {
    profileContainer.innerHTML = "";
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
            <p class="card-text"><strong>Location:</strong> ${profile.Location}</p>
            <a href="${profile.ProfileUrl}" target="_blank" class="btn btn-primary">View Profile</a>
          </div>
        </div>
      `;
      profileContainer.appendChild(profileCard);
    });
  }

  // Search bar event listener
  searchBar.addEventListener("input", applyFilters);

  // View All Talents button
  viewAllTalents.addEventListener("click", () => {
    activeFilters = {
      role: [],
      skills: [],
      location: []
    };
    // Uncheck all checkboxes
    Object.values(dropdowns).forEach(dropdown => {
      dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('selected');
      });
    });
    renderFilterPills();
    applyFilters();
  });
});