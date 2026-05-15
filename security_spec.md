# Security Specification - SkillsUp

## Data Invariants
1. A user profile MUST match the authenticated user's UID.
2. Only Admins can approve or suspend users/trainers.
3. Trainers can only modify courses they created.
4. Students can only access courses they have purchased (verified via a purchase record).
5. Submissions MUST belong to the user who created them.
6. Only Trainers can grade submissions for their own courses.
7. Certificates are issued only if the course is completed (logic managed by backend/trainer, but rules protect the document).

## The Dirty Dozen Payloads (Failures)
1. **Identity Spoofing**: User A attempts to update User B's profile.
2. **Privilege Escalation**: Student attempts to set their role to 'admin'.
3. **Invalid Data**: Creating a course with a negative price.
4. **Unauthorized Deletion**: Student attempts to delete a course.
5. **Shadow Update**: Adding an `isAdmin: true` field to a user profile.
6. **Bypassing Approval**: Trainer sets their own course status to 'approved'.
7. **Theft**: Student attempts to read a submission belonging to another student.
8. **Malicious Grading**: Student attempts to grade their own submission.
9. **Spamming**: Creating 1000 courses with 1MB strings in the title.
10. **Ghost Purchase**: Creating a purchase record for self without Razorpay verification (backend should handle verification, rules should restrict creation).
11. **Resource Poisoning**: Using a 5KB string as a document ID.
12. **Public PII Leak**: Unauthenticated user attempting to list all user emails.

## Firestore Rules Draft
(Writing to firestore.rules soon)
