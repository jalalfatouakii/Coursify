// Download.js
import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import '../styles/Pages.css';

function Download() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [courses, setCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [currentFile, setCurrentFile] = useState('');
  const [currentNumber, setCurrentNumber] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [fileTypes, setFileTypes] = useState({
    pdf: true,
    docx: false,
    pptx: false,
  });
  const [dateFilter, setDateFilter] = useState({
    before: '',
    after: '',
  });
  const [acceptAllFiles, setAcceptAllFiles] = useState(false);

  const fetchCourses = async () => {
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

  const handleLogin = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleCourseClick = (course) => {
    setMessage('')
    setSelectedCourse(course);
  };

  const handleDownload = async () => {
    setIsLoading(true);
    setProgress(0);
    setMessage('');
    try {
      const courseContentsUrl = new URL("https://studium.umontreal.ca/webservice/rest/server.php");
      courseContentsUrl.searchParams.append("moodlewsrestformat", "json");
      courseContentsUrl.searchParams.append("wsfunction", "core_course_get_contents");
      courseContentsUrl.searchParams.append("wstoken", token);
      courseContentsUrl.searchParams.append("courseid", selectedCourse.id);

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
      const filteredFiles = modules.flatMap(module => module.contents || [])
        .filter(content => {
          let fileTypeMatch; 
          if (acceptAllFiles){
            fileTypeMatch = content.type === 'file';
          } else{
            fileTypeMatch = Object.keys(fileTypes).some(type => fileTypes[type] && content.filename.endsWith(`.${type}`));
          }
          const dateMatch = (!dateFilter.before || new Date(content.timemodified * 1000) <= new Date(dateFilter.before)) &&
                            (!dateFilter.after || new Date(content.timemodified * 1000) >= new Date(dateFilter.after));
          return fileTypeMatch && dateMatch;
        });

      if (filteredFiles.length === 0) {
        console.log("No files found matching the filters");
        setIsLoading(false);
        setMessage('No files found matching the filters');
        return;
      }

      const zip = new JSZip();
      const folder = zip.folder(`${selectedCourse.fullname}_files`);
      setTotalFiles(filteredFiles.length);
      for (let i = 0; i < filteredFiles.length; i++) {
        setCurrentNumber(i);
        const file = filteredFiles[i];
        setCurrentFile(file.filename);
        const fileResponse = await fetch(file.fileurl + `&token=${token}`);
        const fileBlob = await fileResponse.blob();
        folder.file(file.filename, fileBlob);
        setProgress(((i + 1) / filteredFiles.length) * 100);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${selectedCourse.fullname}_files.zip`);
      console.log("Files downloaded and zipped successfully!");
      setMessage('Files downloaded successfully!');
    } catch (error) {
      console.error("Error: Could not download files", error);
      setMessage('Error: Could not download files');
    } finally {
      setIsLoading(false);
      setSelectedCourse(null);
    }
  };

  const handleFileTypeChange = (e) => {
    setFileTypes({
      ...fileTypes,
      [e.target.name]: e.target.checked,
    });
  };

  const handleDateChange = (e) => {
    setDateFilter({
      ...dateFilter,
      [e.target.name]: e.target.value,
    });
  };

  const handleAcceptAllFilesChange = (e) => {
    setAcceptAllFiles(e.target.checked);
  };

  return (
    <div className="Download">
      <h1 id="login-title" className={isLoggedIn ? 'hidden' : ''}>Login to your StudiUM</h1>
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
      {courses.length > 0 && !isLoading && !selectedCourse && (
        <div className="Courses">
          <h2>Your Courses</h2>
          <ul>
            {courses.map(course => (
              <li key={course.id} onClick={() => handleCourseClick(course)} className="course-box">
                <div className="course-image-container">
                  <img src={course.courseimage} alt={course.fullname} className="course-image" />
                </div>
                <div className="course-name">
                  {course.fullname}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedCourse && !isLoading && (
        <div className="Filters">
          <h2>Filters for {selectedCourse.fullname}</h2>
          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                name="acceptAllFiles"
                checked={acceptAllFiles}
                onChange={handleAcceptAllFilesChange}
              />
              Accept All Files
            </label>
            {!acceptAllFiles && (
              <>
                <label>
                  <input
                    type="checkbox"
                    name="pdf"
                    checked={fileTypes.pdf}
                    onChange={handleFileTypeChange}
                  />
                  PDF
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="docx"
                    checked={fileTypes.docx}
                    onChange={handleFileTypeChange}
                  />
                  DOCX
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="pptx"
                    checked={fileTypes.pptx}
                    onChange={handleFileTypeChange}
                  />
                  PPTX
                </label>
              </>
            )}
          </div>
          <div className="filter-group">
            <label>
              Before:
              <input
                type="date"
                name="before"
                value={dateFilter.before}
                onChange={handleDateChange}
              />
            </label>
            <label>
              After:
              <input
                type="date"
                name="after"
                value={dateFilter.after}
                onChange={handleDateChange}
              />
            </label>
          </div>
          <button onClick={handleDownload} className="style-button-form">Download</button>
          <br></br>
          <button onClick={() => setSelectedCourse(null)} className="style-button-form-red">Cancel</button>
        </div>
      )}
      {isLoading && (
        <div className="Loading">
          <h2>Downloading Files...</h2>
          <progress value={progress} max="100"></progress>
          <p>Files downloaded : {currentNumber}/{totalFiles}</p>
          <div className="current-file-box">
            <p>Downloading: {currentFile}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Download;