# 15. Test Plan and Test Cases

## TC-01: Admin Login
- **Precondition**: Admin exists.
- **Steps**: Navigate to /login, enter admin credentials, click login.
- **Expected**: Redirected to Admin Dashboard.
- **Actual**: Passed.

## TC-02: Faculty Registration & Approval
- **Steps**: Register at /register. Login attempts should fail. Admin approves on dashboard. Login succeeds.
- **Expected**: Access denied until approved.
- **Actual**: Passed.

## TC-03: Excel Import
- **Steps**: Upload invalid file. Upload valid file.
- **Expected**: Invalid file throws error. Valid file shows preview. Confirming saves to DB.
- **Actual**: Passed.

## TC-04: Marks Analytics
- **Steps**: Faculty clicks "View Analytics". 
- **Expected**: Class average calculated correctly and normalized to 100%. Graph displays data.
- **Actual**: Passed.