import React, { useState } from 'react';
import { getOverlappingDaysInIntervals } from 'date-fns';
import FilePicker from './FilePicker';
import Table from './Table';
import './index.css';

const App = () => {
  const [employees, setEmployees] = useState([]);

  const onGetFileContent = (content) => {
    const employees = content
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const [employeeId, projectId, dateFrom, dateTo] = line.split(',');
        return {
          employeeId: employeeId.trim(),
          projectId: projectId.trim(),
          dateFrom: new Date(dateFrom.trim()),
          dateTo: dateTo.trim() === 'NULL' ? new Date() : new Date(dateTo.trim())
        }
      });

    const pairsOfEmployeesSortedInDescOrderByDaysWorkedTogether = employees
      // group employees by project
      .reduce((accumulator, employee) => {
        const { projectId, ...restEmployee } = employee;
        const isProjectAdded = accumulator.some(({ projectId }) => projectId === employee.projectId);

        return isProjectAdded
          // if the project is already added, add the employee if it is assigned to that project
          ? accumulator.map((project) => ({
            ...project,
            employees: project.projectId === employee.projectId
              ? [...project.employees, restEmployee]
              : project.employees
          }))
          // otherwise, add the project and the employee to it
          : [...accumulator, {
            projectId: employee.projectId,
            employees: [restEmployee]
          }];
      }, [])
      // map the days worked of each employee for each project
      .map((project) => ({
        ...project,
        employees: project.employees
          .map((employee) => {
            // get the other employees for that project
            const otherEmployees = project.employees.filter(({ employeeId }) => (
              employeeId !== employee.employeeId
            ));

            return {
              employeeId: employee.employeeId,
              // get the days worked with the other employees
              daysWorked: otherEmployees
                .map((otherEmployee) => ({
                  employeeId: otherEmployee.employeeId,
                  // calculate the overlapping days worked of the employee and the other employee
                  daysWorked: getOverlappingDaysInIntervals({
                    start: employee.dateFrom,
                    end: employee.dateTo
                  }, {
                    start: otherEmployee.dateFrom,
                    end: otherEmployee.dateTo
                  })
                }))
                // sort the overlapping days in descending order
                .sort((a, b) => (
                  b.daysWorked - a.daysWorked
                ))
            }
          })
          // filter out employees that worked alone on a project
          .filter((employee) => (
            employee.daysWorked.length > 0
          ))
      }))
      // filter out projects for which only one employee worked
      .filter((project) => project.employees.length > 0)
      // map for each project the pair of employees with most worked days together
      .map((project) => ({
        ...project,
        employees: project.employees
          // map each employee to the other employee with which they have worked for the longest time period together
          .map((employee) => {
            const [firstDaysWorked] = employee.daysWorked;

            return {
              employeeId: employee.employeeId,
              otherEmployeeId: firstDaysWorked.employeeId,
              daysWorked: firstDaysWorked.daysWorked
            };
          })
          // filter out duplicate employee pairs
          .reduce((accumulator, employee) => (
            accumulator.some(({ employeeId, otherEmployeeId }) => (
              (employeeId === employee.employeeId && otherEmployeeId === employee.otherEmployeeId)
                || (otherEmployeeId === employee.employeeId && employeeId === employee.otherEmployeeId)
            ))
            ? accumulator
            : [...accumulator, employee]
          ), [])
          // sort the employee pairs by days worked together in descending order
          .sort((a, b) => b.daysWorked - a.daysWorked)
      }))
      // reduce the projects groups into an array of employees and append the project id to each of them
      .reduce((accumulator, project) => (
        [...accumulator, ...project.employees.map((employee) => ({
          ...employee,
          projectId: project.projectId
        }))]
      ), [])
      // sort the pairs by days worked together in descending order
      .sort((a, b) => b.daysWorked - a.daysWorked);

    setEmployees(pairsOfEmployeesSortedInDescOrderByDaysWorkedTogether);

    console.log('Results:');
    console.log(pairsOfEmployeesSortedInDescOrderByDaysWorkedTogether);
  };

  const onDropFiles = ([file]) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      onGetFileContent(fileReader.result);
    }

    fileReader.readAsText(file);
  };

  return (
    <div className="app">
      <div className="app__content">
        <div className="app__title">
          <h2>Employees Task</h2>
          <span>For Sirma Solutions</span>
        </div>

        <FilePicker
          accept="text/plain"
          onDrop={onDropFiles}
        />

        {employees.length > 0 && (
          <div className="app__employees">
            <Table
              items={employees}
              columns={[{
                name: 'employeeId',
                label: 'Employee ID #1',
                render: ({ employeeId }) => (
                  <span>{employeeId}</span>
                )
              }, {
                name: 'otherEmployeeId',
                label: 'Employee ID #2',
                render: ({ otherEmployeeId }) => (
                  <span>{otherEmployeeId}</span>
                )
              }, {
                name: 'projectId',
                label: 'Project ID',
                render: ({ projectId }) => (
                  <span>{projectId}</span>
                )
              }, {
                name: 'daysWorked',
                label: 'Days worked',
                render: ({ daysWorked }) => (
                  <span>{daysWorked}</span>
                )
              }]}
            />
          </div>
        )}
      </div>

      <footer className="app__footer">
        <span>
          Made by <a href="https://github.com/nevendyulgerov" target="_blank" rel="noopener noreferrer">Neven Dyulgerov</a> © {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}

export default App;
