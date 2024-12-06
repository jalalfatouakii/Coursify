// Download.js
import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import '../styles/Pages.css';
import axios from 'axios';


function Download() {
  // Function to check if a link is a Google Docs link
  const isGoogleDocsLink = (url) => {
    const googleDocsPattern = /https:\/\/docs\.google\.com\/(document|presentation)\/d\/.+/;
    return googleDocsPattern.test(url);
  };
  /*
  const isGoogleDriveLink = (url) => {
    const googleDrivePattern = /https:\/\/drive\.google\.com\/file\/d\/.+/;
    return googleDrivePattern.test(url);
  };
  const extractFileIdFromUrl = (url) => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };
  const downloadGoogleDriveFile = async (fileId) => {
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const response = await axios.get(downloadUrl, { responseType: 'blob' });
    return response.data;
  };*/
  // Function to download the PDF version of the Google Docs link
  const downloadGoogleDocsPdf = async (url) => {
    console.log('Downloading Google Docs PDF:', url);
    const pdfUrl = url.replace(/\/edit.*$/, '/export?format=pdf');
    const response = await axios.get(pdfUrl, { responseType: 'blob' });
    console.log('Downloaded Google Docs PDF:', response.data);
    return response.data;
  };

  // Function to add the downloaded PDF to a ZIP file
  const addPdfToZip = async (zip, url, fileName, folder) => {
    if (isGoogleDocsLink(url)) {
      const pdfBlob = await downloadGoogleDocsPdf(url);
      folder.file(`${fileName}.pdf`, pdfBlob);
    }
    /*
    else if (isGoogleDriveLink(url)){
      const pdfBlob = await downloadGoogleDriveFile(extractFileIdFromUrl(url));
      folder.file(`${fileName}.pdf`, pdfBlob);
    }*/

  };
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
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
  const [customText, setCustomText] = useState('');
  const [fileTypes, setFileTypes] = useState({
    pdf: true,
    docx: false,
    pptx: false,
    links: false,
    custom: false,
  });
  const [dateFilter, setDateFilter] = useState({
    before: '',
    after: '',
  });
  const [acceptAllFiles, setAcceptAllFiles] = useState(false);
  const handleCustomTextChange = (event) => {
    setCustomText(event.target.value);
  };
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
      console.log(data)
      const TOKEN = data.token;
      setToken(TOKEN);
      const userInfoUrl = new URL("https://studium.umontreal.ca/webservice/rest/server.php");
      userInfoUrl.searchParams.append("moodlewsrestformat", "json");
      userInfoUrl.searchParams.append("wsfunction", "core_webservice_get_site_info");
      userInfoUrl.searchParams.append("wstoken", TOKEN);

      const userInfoResponse = await fetch(userInfoUrl, {
        method: 'GET'
      });

      if (userInfoResponse.status !== 200) {
        console.error("Error: Could not fetch user info");
        return;
      }

      const userInfoData = await userInfoResponse.json();
      console.log("User info response:", userInfoData);
      const userName = userInfoData.fullname;
      console.log("User's name:", userName);
      setFullname(userName);
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
            fileTypeMatch = content.type === 'file' || content.type === 'url';
          } 
          else if (fileTypes.custom){
            fileTypeMatch = content.filename.toLowerCase().includes(customText.toLowerCase());
          }
          else if (fileTypes.links){
            fileTypeMatch = content.type === 'url';
          }
          else{
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
      if (fileTypes.links || acceptAllFiles){
        console.log("Links found matching the filters");
        console.log(filteredFiles);
        const links = [];
        filteredFiles.forEach(link => {
          const filename = link.filename;
          const fileurl = link.fileurl;
          links.push({filename, fileurl});
        });
        console.log(links); 
        const zip2 = new JSZip();
        const folder2 = zip2.folder(`${selectedCourse.fullname}_files`);
        setTotalFiles(filteredFiles.length + 1);
        for (let i = 0; i < links.length; i++) {
          const link = links[i].fileurl;
          await addPdfToZip(zip2, link, `file${i + 1}`,folder2);
          setCurrentNumber(i);
          setCurrentFile(links[i].filename);
          setProgress(((i + 1) / filteredFiles.length) * 100);
          //folder2.file(links[i].filename, fblob);
        }
        console.log(folder2)
             
        console.log("Files downloaded and zipped successfully!"); 
        const textContent = links.map(link => `${link.filename} : ${link.fileurl}`).join('\n\n');
        setCurrentNumber(filteredFiles.length);
        setCurrentFile(`${selectedCourse.fullname}_links.txt`);
        setProgress(100);
        const txtfile = new Blob([textContent], { type: 'text/plain' });
        folder2.file(`${selectedCourse.fullname}_links.txt`, txtfile);
        const zipBlob2 = await zip2.generateAsync({ type: 'blob' });
        if (!acceptAllFiles){ 
          saveAs(zipBlob2, `${selectedCourse.fullname}_links.zip`); 
          setIsLoading(false);
          return;
        }
        
        
      
      }
      const zip = new JSZip();
      const folder = zip.folder(`${selectedCourse.fullname}_files`);
      setTotalFiles(filteredFiles.length);
      const links = [];
      for (let i = 0; i < filteredFiles.length; i++) {
        setCurrentNumber(i);
        const file = filteredFiles[i];
        if (file.type === 'url'){
          const filename = file.filename;
          const fileurl = file.fileurl;
          links.push({filename, fileurl});
          continue
        }
        setCurrentFile(file.filename);
        const fileResponse = await fetch(file.fileurl + `&token=${token}`);
        const fileBlob = await fileResponse.blob();
        folder.file(file.filename, fileBlob);
        setProgress(((i + 1) / filteredFiles.length) * 100);
      }
      if (acceptAllFiles){
        for (let i = 0; i < links.length; i++) {
          const link = links[i].fileurl;
          await addPdfToZip(zip, link, `file${i + 1}`,folder);
          setCurrentNumber(i);
          setCurrentFile(links[i].filename);
          setProgress(((i + 1) / filteredFiles.length) * 100);
        }
        const textContent = links.map(link => `${link.filename} : ${link.fileurl}`).join('\n\n');
        const txtfile = new Blob([textContent], { type: 'text/plain' });
        folder.file(`${selectedCourse.fullname}_links.txt`, txtfile);
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
          <h2>Welcome {fullname}</h2>
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
                <label>
                  <input
                    type="checkbox"
                    name="links"
                    checked={fileTypes.links}
                    onChange={handleFileTypeChange}
                  />
                  Links
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="custom"
                    checked={fileTypes.custom}
                    onChange={handleFileTypeChange}
                  />
                  Custom
                </label>
                {fileTypes.custom && (
                  <input
                    type="text"
                    value={customText}
                    onChange={handleCustomTextChange}
                    placeholder="Enter custom text"
                  />
                )}
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