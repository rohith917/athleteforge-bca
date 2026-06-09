/**
 * Shown when student account has no linked athlete profile.
 */
export default function StudentLinkAlert({ message }) {
  return (
    <div className="student-link-alert">
      <h5>Profile not linked yet</h5>
      <p>{message || 'Register with the same email as your athlete record, or ask your coach to link your account.'}</p>
      <p className="student-demo-hint">
        <strong>Demo athlete login:</strong> rahul.sharma@email.com / student123
      </p>
    </div>
  )
}