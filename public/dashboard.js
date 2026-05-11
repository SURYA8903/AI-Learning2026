const API_URL = 'http://localhost:3000/api';

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
    try {
        const response = await fetch(`${API_URL}/certificates/${userId}`);
        const certs = response.ok ? await response.json() : [];
        renderCertificates(certs);
    } catch (error) {
        console.error('Error loading certificates:', error);
    }
}

function renderCertificates(certs) {
    const list = document.getElementById('certificatesList');
    if (!list) return;

    if (!certs.length) {
        list.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500 italic">No certificates earned yet. Complete 100% of a course to earn one!</div>';
    } else {
        list.innerHTML = certs.map(cert => `
            <div class="panel-card border-t-4 border-yellow-500">
                <div class="text-3xl mb-2">🎓</div>
                <h4 class="font-bold text-gray-900">${cert.course_title}</h4>
                <p class="text-sm text-gray-600 mt-1">Issued on ${new Date(cert.issued_at).toLocaleDateString()}</p>
                <button onclick="downloadCertificate('${cert.id}')" class="w-full mt-4 py-2 bg-yellow-50 text-yellow-700 font-bold rounded-lg hover:bg-yellow-100 transition">View Certificate</button>
            </div>
        `).join('');
    }
}

function downloadCertificate(certId) {
    alert('Certificate generation system is being finalized. You will be able to download your PDF soon!');
}
