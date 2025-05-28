export default function UserHeader({ user }) {
  return (
    <h1 style={{ marginBottom: "1rem" }}>
      Welcome {user ? user.email : "Guest"}
    </h1>
  );
}
