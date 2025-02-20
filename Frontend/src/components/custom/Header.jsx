import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/Services/login";
import { addUserData } from "@/features/user/userFeatures";
import { Sun, Moon, Menu, X } from "lucide-react"; // Icons for UI
import lightLogo from "../../assets/WhiteLogo.png";
import darkLogo from "../../assets/DarkLogo.png";
import { Button } from "../ui/button";

function Header({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.statusCode === 200) {
        dispatch(addUserData("")); // Reset user data
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-5">
        {/* Logo */}
        <Link to="/">
          <img
            src={theme === "light" ? lightLogo : darkLogo}
            alt="logo"
            className="w-24"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
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

        {/* Mobile Hamburger Menu */}
        <button
          className="md:hidden focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col items-center gap-4 bg-gray-100 dark:bg-gray-800 p-5">
          <Button variant="outline" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
          {user ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  navigate("/dashboard");
                  toggleMenu();
                }}
              >
                Dashboard
              </Button>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Link to="/auth/sign-in">
              <Button onClick={toggleMenu}>Get Started</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Header;
