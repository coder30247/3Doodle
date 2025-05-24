export default function UserHeader({ user }) {
  return (
    <h1 style={{ marginBottom: "1rem" }}>
      Welcome is this punda working da {user ? user.email : "Guest"}
    </h1>
  );
}
