import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import '../styles/Pages.css'; // Import the CSS file for styling

const Planificateur = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchToken = async () => {
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
      return TOKEN;
    } catch (error) {
      console.error("Error: Could not log in", error);
    }
  };
  
  const fetchHomeworks = async () => {
    const TOKEN = token || await fetchToken();
    if (!TOKEN) {
      console.error("Error: No token available");
      return;
    }
    setIsLoggedIn(true); 

    const homeworksUrl = new URL("https://studium.umontreal.ca/webservice/rest/server.php");
    homeworksUrl.searchParams.append("moodlewsrestformat", "json");
    homeworksUrl.searchParams.append("wsfunction", "mod_assign_get_assignments");
    homeworksUrl.searchParams.append("wstoken", TOKEN);

    try {
      const response = await fetch(homeworksUrl);
      const data = await response.json();
      const upcomingHomeworks = data.courses.flatMap(course =>
        course.assignments.filter(assignment =>
          
          new Date(assignment.duedate * 1000) > new Date()
        ).map(assignment => ({
          ...assignment,
          courseName: course.fullname
          
        }))
      );
      setHomeworks(upcomingHomeworks);
    } catch (error) {
      console.error('Error fetching homeworks:', error);
    }
  };

  const createICSFile = () => {
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\n';
    homeworks.forEach(homework => {
      const startDate = new Date(homework.duedate * 1000);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
      icsContent += `BEGIN:VEVENT\nSUMMARY:${homework.name}\nDESCRIPTION:${homework.courseName}\nDTSTART:${startDate.toISOString().replace(/-|:|\.\d+/g, '')}\nDTEND:${endDate.toISOString().replace(/-|:|\.\d+/g, '')}\nEND:VEVENT\n`;
    });
    icsContent += 'END:VCALENDAR';
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    saveAs(blob, 'homeworks.ics');
  };

return (
    <div className="planificateur">
        <h1 className={isLoggedIn ? 'hidden' : ''}>Login to view your planned homeworks</h1>
        <div className={`login-form ${isLoggedIn ? 'hidden' : ''}`}>
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
            <button className="style-button" onClick={fetchHomeworks}>Fetch Homeworks</button>
        </div>
        
        <h2 className={isLoggedIn ? '' : 'hidden'}>Upcoming Homeworks</h2>
        <div className="homework-list">
            {homeworks.reduce((acc, homework) => {
                const courseIndex = acc.findIndex(course => course.courseName === homework.courseName);
                if (courseIndex === -1) {
                    acc.push({ courseName: homework.courseName, assignments: [homework] });
                } else {
                    acc[courseIndex].assignments.push(homework);
                }
                return acc;
            }, []).map(course => (
                <div key={course.courseName} className="course-section">
                    <h3>{course.courseName}</h3>
                    <ul>
                        {course.assignments.map(homework => (
                            <li key={homework.id} className="homework-item">
                                <div className="homework-name">{homework.name}</div>
                                <div className="homework-due">Due: {new Date(homework.duedate * 1000).toLocaleString()}</div>
                                <br></br>
                                <button 
                                    className="style-button" 
                                    onClick={() => window.location.href = `https://studium.umontreal.ca/course/view.php?id=${homework.course}`}
                                >
                                    View Course
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
        {homeworks.length > 0 && (
        <button className="style-button" onClick={createICSFile}>Save to Calendar</button>
      )}
    </div>
);
};

export default Planificateur;