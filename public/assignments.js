async function loadAssignments(userId) {
    try {
        const response = await fetch(`${API_URL}/assignments/user/${userId}`);
        const data = await response.ok ? await response.json() : { pending: [], submitted: [] };
        renderAssignments(data);
    } catch (error) {
        console.error('Error loading assignments:', error);
    }
}

function renderAssignments(data) {
    const pendingList = document.getElementById('pendingAssignmentsList');
    const submittedList = document.getElementById('submittedAssignmentsList');

    if (pendingList) {
        if (!data.pending.length) {
            pendingList.innerHTML = '<p class="text-gray-500">No pending assignments.</p>';
        } else {
            pendingList.innerHTML = data.pending.map(asg => `
                <div class="panel-card mb-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-gray-900">${asg.title}</h4>
                            <p class="text-sm text-gray-600">${asg.course_title}</p>
                            <p class="text-xs text-red-500 mt-1">Due: ${asg.due_date ? new Date(asg.due_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <button onclick="showSubmitModal(${asg.id}, '${asg.title}')" class="btn-primary text-xs">Submit</button>
                    </div>
                </div>
            `).join('');
        }
    }

    if (submittedList) {
        if (!data.submitted.length) {
            submittedList.innerHTML = '<p class="text-gray-500">No submitted assignments.</p>';
        } else {
            submittedList.innerHTML = data.submitted.map(asg => `
                <div class="panel-card mb-4 opacity-75">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-gray-900">${asg.title}</h4>
                            <p class="text-sm text-gray-600">${asg.course_title}</p>
                            <p class="text-xs text-green-600 mt-1">Status: ${asg.submission_status}</p>
                        </div>
                        <span class="text-xs font-bold ${asg.grade ? 'text-purple-600' : 'text-gray-500'}">
                            Grade: ${asg.grade || 'Pending'}
                        </span>
                    </div>
                </div>
            `).join('');
        }
    }
}

async function submitAssignment(assignmentId, userId, content) {
    try {
        const response = await fetch(`${API_URL}/submissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignment_id: assignmentId, user_id: userId, content })
        });
        if (response.ok) {
            alert('Assignment submitted successfully!');
            loadAssignments(userId);
            closeSubmitModal();
        } else {
            alert('Failed to submit assignment');
        }
    } catch (error) {
        console.error('Error submitting assignment:', error);
    }
}
