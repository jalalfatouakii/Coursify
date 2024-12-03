// GetStarted.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import '../styles/Pages.css';

function GetStarted() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [courses, setCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const url = new URL("https://studium.umontreal.ca/login/token.php");
      url.searchParams.append("username", username);
      url.searchParams.append("password", password);
      url.searchParams.append("service", "moodle_mobile_app");

      const response = await fetch(url, {
        method: 'GET'
      });

      if (response.status !== 200) {
        console.error("Error: Could not log in");
        return;
      }

      const data = await response.json();
      const TOKEN = data.token;
      setToken(TOKEN);
      console.log("Logged in successfully! Token:", TOKEN);

      // Fetch courses using the token
      const coursesUrl = new URL("https://studium.umontreal.ca/webservice/rest/server.php");
      coursesUrl.searchParams.append("moodlewsrestformat", "json");
      coursesUrl.searchParams.append("wsfunction", "core_course_get_enrolled_courses_by_timeline_classification");
      coursesUrl.searchParams.append("wstoken", TOKEN);
      coursesUrl.searchParams.append("classification", "all"); // Add the classification parameter

      const coursesResponse = await fetch(coursesUrl, {
        method: 'GET'
      });

      if (coursesResponse.status !== 200) {
        console.error("Error: Could not fetch courses");
        return;
      }

      const coursesData = await coursesResponse.json();
      console.log("Courses response:", coursesData);
      if (coursesData && coursesData.courses) {
        setCourses(coursesData.courses);
        console.log("Courses fetched successfully!", coursesData.courses);
        setIsLoggedIn(true); // Set the logged-in state to true
      } else {
        console.error("Error: Unexpected response format", coursesData);
      }
    } catch (error) {
      console.error("Error: Could not log in or fetch courses", error);
    }
  };

  const handleCourseClick = async (courseId, courseName) => {
    setIsLoading(true);
    setProgress(0);
    setMessage('');
    try {
      const courseContentsUrl = new URL("https://studium.umontreal.ca/webservice/rest/server.php");
      courseContentsUrl.searchParams.append("moodlewsrestformat", "json");
      courseContentsUrl.searchParams.append("wsfunction", "core_course_get_contents");
      courseContentsUrl.searchParams.append("wstoken", token);
      courseContentsUrl.searchParams.append("courseid", courseId);

      const courseContentsResponse = await fetch(courseContentsUrl, {
        method: 'GET'
      });

      if (courseContentsResponse.status !== 200) {
        console.error("Error: Could not fetch course contents");
        return;
      }

      const courseContentsData = await courseContentsResponse.json();
      console.log("Course contents response:", courseContentsData);

      const modules = courseContentsData.flatMap(section => section.modules);
      const pdfFiles = modules.flatMap(module => module.contents || [])
        .filter(content => content.type === 'file' && content.filename.endsWith('.pdf'));

      if (pdfFiles.length === 0) {
        console.log("No PDF files found in this course");
        setIsLoading(false);
        setMessage('No PDF files found in this course');
        return;
      }

      const zip = new JSZip();
      const folder = zip.folder(`${courseName}_pdfs`);

      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const fileResponse = await fetch(file.fileurl + `&token=${token}`);
        const fileBlob = await fileResponse.blob();
        folder.file(file.filename, fileBlob);
        setProgress(((i + 1) / pdfFiles.length) * 100);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${courseName}_pdfs.zip`);
      console.log("PDF files downloaded and zipped successfully!");
      setMessage('PDFs downloaded successfully!');
    } catch (error) {
      console.error("Error: Could not download PDFs", error);
      setMessage('Error: Could not download PDFs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="GetStarted">
      <h1 id="login-title" className={isLoggedIn ? 'hidden' : ''}>Login to your StudiUM account</h1>
      <form onSubmit={handleLogin} id="login-form" className={`login-form ${isLoggedIn ? 'hidden' : ''}`}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="style-button">Login</button>
      </form>
      {message && !isLoading && (
        <div className="Message">
          <h2>{message}</h2>
        </div>
      )}
      {courses.length > 0 && !isLoading && (
        <div className="Courses">
          <h2>Your Courses</h2>
          <ul>
            {courses.map(course => (
              <li key={course.id} onClick={() => handleCourseClick(course.id, course.fullname)}>{course.fullname}</li>
            ))}
          </ul>
        </div>
      )}
      {isLoading && (
        <div className="Loading">
          <h2>Downloading PDFs...</h2>
          <progress value={progress} max="100"></progress>
        </div>
      )}
      
    </div>
  );
}

export default GetStarted;