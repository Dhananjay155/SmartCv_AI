import React, { useEffect, useState } from "react";
import lightLogo from "../../assets/WhiteLogo.png"; // Light mode logo
import darkLogo from "../../assets/DarkLogo.png"; // Dark mode logo
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/Services/login";
import { addUserData } from "@/features/user/userFeatures";
import { Sun, Moon } from "lucide-react"; // Icons for toggle

function Header({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.statusCode === 200) {
        dispatch(addUserData("")); // Reset user data
        navigate("/"); // Redirect to home
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div
      id="printHeader"
      className="flex justify-between px-10 py-5 shadow-md items-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
    >
      <Link to="/" className="cursor-pointer">
        <img
          src={theme === "light" ? lightLogo : darkLogo} // Switch logo based on theme
          alt="logo"
          width={100}
          height={100}
        />
      </Link>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={toggleTheme}>
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </Button>
        {user ? (
          <>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <Link to="/auth/sign-in">
            <Button>Get Started</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
