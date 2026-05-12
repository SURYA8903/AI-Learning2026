async function loadClasses(userId) {
    try {
        const response = await fetch(`${API_URL}/classes/${userId}`);
        const classes = response.ok ? await response.json() : [];
        renderClasses(classes);
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

function renderClasses(classes) {
    const liveClassesList = document.getElementById('liveClassesList');
    const recordedClassesList = document.getElementById('recordedClassesList');

    if (liveClassesList) {
        const live = classes.filter(cl => cl.live_link && new Date(cl.scheduled_at) > new Date());
        if (!live.length) {
            liveClassesList.innerHTML = '<p class="text-gray-500">No upcoming live classes.</p>';
        } else {
            liveClassesList.innerHTML = live.map(cl => `
                <div class="panel-card mb-4 border-l-4 border-blue-500">
                    <h4 class="font-bold text-gray-900">${cl.title}</h4>
                    <p class="text-sm text-gray-600">${cl.course_title}</p>
                    <p class="text-xs text-blue-600 mt-2">Starts: ${new Date(cl.scheduled_at).toLocaleString()}</p>
                    <a href="${cl.live_link}" target="_blank" class="inline-block mt-3 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">Join Live</a>
                </div>
            `).join('');
        }
    }

    if (recordedClassesList) {
        const recorded = classes.filter(cl => cl.video_url);
        if (!recorded.length) {
            recordedClassesList.innerHTML = '<p class="text-gray-500">No recorded classes available.</p>';
        } else {
            recordedClassesList.innerHTML = recorded.map(cl => `
                <div class="panel-card mb-4">
                    <h4 class="font-bold text-gray-900">${cl.title}</h4>
                    <p class="text-sm text-gray-600">${cl.course_title}</p>
                    <p class="text-xs text-gray-500 mt-1">Duration: ${cl.duration || 'N/A'}</p>
                    <a href="${cl.video_url}" target="_blank" class="inline-block mt-3 px-4 py-1 bg-gray-100 text-gray-900 text-xs font-bold rounded hover:bg-gray-200">Watch Video</a>
                </div>
            `).join('');
        }
    }
}
