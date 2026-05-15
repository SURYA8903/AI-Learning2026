async function loadDashboardStats(userId) {
    try {
        const enrollmentsRes = await fetch(`${API_URL}/enrollments/${userId}`);
        const enrollments = enrollmentsRes.ok ? await enrollmentsRes.json() : [];
        
        const assignmentsRes = await fetch(`${API_URL}/assignments/user/${userId}`);
        const assignments = assignmentsRes.ok ? await assignmentsRes.json() : { pending: [], submitted: [] };
        
        const classesRes = await fetch(`${API_URL}/classes/${userId}`);
        const classes = classesRes.ok ? await classesRes.json() : [];

        // Update Dashboard UI
        const pendingAsgCount = document.getElementById('dashPendingAssignments');
        if (pendingAsgCount) pendingAsgCount.textContent = assignments.pending.length;

        const upcomingClassesCount = document.getElementById('dashUpcomingClasses');
        if (upcomingClassesCount) {
            const upcoming = classes.filter(cl => new Date(cl.scheduled_at) > new Date()).length;
            upcomingClassesCount.textContent = upcoming;
        }

        const avgProgress = enrollments.length 
            ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length) 
            : 0;
        const dashProgress = document.getElementById('dashAverageProgress');
        if (dashProgress) dashProgress.textContent = `${avgProgress}%`;

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadCertificates(userId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/certificate/my-certificates`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = response.ok ? await response.json() : { data: [] };
        renderCertificates(data.data || []);
    } catch (error) {
        console.error('Error loading certificates:', error);
    }
}

function renderCertificates(certs) {
    const list = document.getElementById('certificatesList');
    if (!list) return;

    if (!certs.length) {
        list.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500 italic">No certificates earned yet. Complete courses and wait for trainer approval to earn one!</div>';
    } else {
        list.innerHTML = certs.map(cert => `
            <div class="panel-card border-t-4 border-yellow-500">
                <div class="text-3xl mb-2">🎓</div>
                <h4 class="font-bold text-gray-900">${cert.courseTitle}</h4>
                <div class="text-xs text-gray-500 mb-2">ID: ${cert.certificateId}</div>
                <p class="text-sm text-gray-600 mt-1">Issued on ${new Date(cert.issuedDate).toLocaleDateString()}</p>
                <a href="${cert.pdfUrl}" target="_blank" class="w-full mt-4 py-2 bg-yellow-50 text-yellow-700 font-bold rounded-lg hover:bg-yellow-100 transition text-center block">View Certificate</a>
            </div>
        `).join('');
    }
}
