import { useEffect, useState } from "react";
import "./AdminUsersPage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";



const API_URL = "http://localhost:3000";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  provider: string;
  passwordCreated: boolean;
  setupExpired: boolean;
  passwordSetupExpiresAt: string | null;
  createdAt: string;
}

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth()


  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        credentials: "include",
      });

      const data = await response.json();

      console.log(
  data.users.map((user: AdminUser) => ({
    id: user.id,
    email: user.email,
    passwordCreated: user.passwordCreated,
    setupExpired: user.setupExpired,
    expiresAt: user.passwordSetupExpiresAt,
  }))
);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchUsers();

  const interval = setInterval(() => {
    fetchUsers();
  }, 5000);

  return () => clearInterval(interval);
}, []);

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="admin-loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users-error">
        <p>{error}</p>
      </div>
    );
  }

  const resendPasswordSetup = async (userId: number) => {
  try {
    const response = await fetch(
      `${API_URL}/admin/users/${userId}/resend-password-setup`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to resend setup link");
    }

    // alert(data.message);

    await fetchUsers();
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong"
    );
  }
};

  return (
    <div className="admin-users-page">


      <div className="admin-users-header">
  <div>
    <h1>Admin Users</h1>

    <p>
      Manage user accounts and password setup links.
    </p>
  </div>

  <button
    type="button"
    className="admin-logout-btn"
    onClick={async () => {
      await logout();
      navigate("/");
    }}
  >
    Logout
  </button>
</div>

   
      <div className="admin-users-table-container">

        <table className="admin-users-table">

          <thead>
            <tr>
              <th>S.No</th>
              <th>User Email</th>
              <th>Password Status</th>
              <th>Setup Link</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {users.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (

                <tr key={user.id}>

    
                  <td className="admin-user-sno">
                    {index + 1}
                  </td>


                  <td className="admin-user-email">
                    {user.email}
                  </td>

 
                  <td>
                    <span
                      className={
                        user.passwordCreated
                          ? "admin-status admin-status-created"
                          : "admin-status admin-status-not-created"
                      }
                    >
                      {user.passwordCreated
                        ? "Created"
                        : "Not Created"}
                    </span>
                  </td>

 
                  <td>
                    {user.passwordCreated ? (
                      <span className="admin-setup-completed">
                        Completed
                      </span>
                    ) : user.setupExpired ? (
                      <span className="admin-setup-expired">
                        Expired
                      </span>
                    ) : (
                      <span className="admin-setup-active">
                        Active
                      </span>
                    )}
                  </td>

    
                  <td>
                    <button
                      className="admin-resend-btn"
                     
                      // disabled={
                      //   !user.setupExpired ||
                      //   user.passwordCreated
                      // }
                      disabled={
  !user.setupExpired ||
  user.passwordCreated
}
                       onClick={() => resendPasswordSetup(user.id)}
                    >
                      Send New Link
                    </button>
                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminUsersPage;