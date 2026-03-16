let searchCount = parseInt(localStorage.getItem('searchCount') || '0');
let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

// Page load pe recent searches dikhao
window.addEventListener('DOMContentLoaded', () => {
  updateSearchCount();
  renderRecentSearches();
  createParticles();

  document.getElementById('symptom-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      getDiagnosis();
    }
  });
});

// Sample chip click
function fillSymptom(text) {
  document.getElementById('symptom-input').value = text;
  document.getElementById('symptom-input').focus();
}

// Main diagnosis function
async function getDiagnosis() {
  const symptoms = document.getElementById('symptom-input').value.trim();
  if (!symptoms) {
    alert('Please enter your symptoms!');
    return;
  }

  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('results').classList.add('hidden');
  document.getElementById('diagnose-btn').disabled = true;

  try {
    const response = await fetch('http://localhost:3000/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms })
    });

    const data = await response.json();

    if (data.error) {
      alert('Error: ' + data.error);
      return;
    }

    // Top matches dikhao
    const matchesList = document.getElementById('matches-list');
    matchesList.innerHTML = '';
    data.top_matches.forEach((match, i) => {
      matchesList.innerHTML += `
        <div class="match-item">
          <span>#${i + 1}</span> — ${match.disease}
        </div>`;
    });

    // AI diagnosis
    document.getElementById('diagnosis-text').textContent = data.ai_diagnosis;
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

    // Recent search save karo
    saveRecentSearch(symptoms, data.top_matches[0]?.disease || 'Unknown');

  } catch (error) {
    alert('Server se connect nahi ho pa raha! Server chal raha hai?');
    console.error(error);
  } finally {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('diagnose-btn').disabled = false;
  }
}

// Recent search save karo
function saveRecentSearch(symptoms, topDisease) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  recentSearches.unshift({ symptoms, topDisease, time: timeStr });
  if (recentSearches.length > 5) recentSearches.pop();

  searchCount++;
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  localStorage.setItem('searchCount', searchCount);

  updateSearchCount();
  renderRecentSearches();
}

// Recent searches render karo
function renderRecentSearches() {
  if (recentSearches.length === 0) return;

  document.getElementById('recent-section').style.display = 'block';
  const list = document.getElementById('recent-list');
  list.innerHTML = '';

  recentSearches.forEach(item => {
    list.innerHTML += `
      <div class="recent-item" onclick="fillSymptom('${item.symptoms}')">
        <div>
          <div class="recent-symptoms">${item.symptoms}</div>
          <div class="recent-time">${item.time}</div>
        </div>
        <div class="recent-disease">${item.topDisease}</div>
      </div>`;
  });
}

function updateSearchCount() {
  document.getElementById('search-count').textContent = searchCount;
}

// Floating particles banao
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 6 + 4) + 's';
    p.style.animationDelay = (Math.random() * 5) + 's';
    p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
    container.appendChild(p);
  }
}