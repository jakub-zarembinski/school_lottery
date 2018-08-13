import React, { Component } from 'react'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './app.css'

import School from './school'
import Student from './student'
import Grade from './grade'
import { getSchools, 
        manageSchool,  
        manageGrade,
        newGrade, 
        editGrade, 
        reset,
        login,
        initScatter,
        createSchool,
        modifySchool,
        deleteSchool,
        saveStudent,
        updateStudent,
        deleteStudent,
        saveGrade,
        updateGrade,
        deleteGrade,
        runLottery
        } from "./reducers/eos"

class App extends Component {
  
  constructor(props) {
    super(props)

    this.state = {
      scatter: null,
      error: null,
      userType: -1, //-1 is unauthorized, 0 is superintendant, 1 is parent
      selectedGrade: null,
      selectedStudent: null
    }
  }

  componentDidMount() {

    document.addEventListener('scatterLoaded', scatterExtension => {
      const scatter = window.scatter;
      window.scatter = null;
      this.setState({scatter})
      this.props.dispatch(initScatter(scatter))
      this.props.dispatch(getSchools());
  })
  }

  modifySchool(school, name) {
    this.props.dispatch(modifySchool(school, name))
  }

  runLottery(school) {
    this.props.dispatch(runLottery(school))
  }

  createSchool(name) {
    this.props.dispatch(createSchool(name))
  }

  deleteSchool(school) {
    this.props.dispatch(deleteSchool(school))
  }

  saveStudent(student, grade) {
    this.props.dispatch(saveStudent(student, grade))
  }

  updateStudent(student) {
    this.props.dispatch(updateStudent(student))
  }

  deleteStudent(student) {
    this.props.dispatch(deleteStudent(student))
  }

  saveGrade(school, gradeInfo) {
    this.props.dispatch(saveGrade(school, gradeInfo))
  }

  updateGrade(grade, gradeInfo) {
    this.props.dispatch(updateGrade(grade, gradeInfo))
  }

  deleteGrade(grade) {
    this.props.dispatch(deleteGrade(grade))
  }

  setStudent(student) {
    this.setState({selectedStudent: student})
  }

  manageStudents(grade) {
    this.props.dispatch(manageGrade(grade))
  }
  
  updateSchool(school, name) {
    if(school.key !== undefined) {
      this.modifySchool(school, name)
    } else {
      this.createSchool(name)
    }
  }

  setGrade(grade) {
    this.props.dispatch(manageGrade(grade))
  }

  editGrade(grade) {
    this.props.dispatch(editGrade(grade))
  }

  addGrade(grade) {
    this.props.dispatch(newGrade())
  }

  newSchool() {
    this.props.dispatch(manageSchool({name: ''}))
  }

  authenticateParent(){
    this.loadScatterIdentity(true)
  }

  authenticateSuperintendent(){
    this.loadScatterIdentity(false)
  }

  logout() {
    this.state.scatter.forgetIdentity().then(() => {
      this.props.dispatch(reset())
  });
  }

  loadScatterIdentity(isParent) {
    this.props.dispatch(login(isParent, this.state.scatter))
  }

  renderAuthenticateButtons() {
    if(this.props.userType === -1 || this.props.identity === undefined) {
      return (
        <div>
          <a href="#" className="pure-menu-heading pure-menu-link">School Lottery</a>
          <a onClick={this.authenticateParent.bind(this)} style={{float: "right", cursor: "pointer"}} className="pure-menu-heading pure-menu-button">Login as Parent</a>
          <a onClick={this.authenticateSuperintendent.bind(this)} style={{float: "right", cursor: "pointer"}} className="pure-menu-heading pure-menu-button">Login as Admin</a>
        </div>  
      )
    } else {
      return (
        <div>
          <a href="#" className="pure-menu-heading pure-menu-link">School Lottery</a>
          <a onClick={this.logout.bind(this)} style={{float: "right", cursor: "pointer"}} className="pure-menu-heading pure-menu-button">Logout</a>
          <div style={{float: "right", color: 'white'}} className="pure-menu-heading pure-menu-button"><i>{this.props.identity.personal.firstname + " " + this.props.identity.personal.lastname}</i></div>
        </div>
      )
    }
  }


  renderUserView() {
    console.log("render user view:"+this.props.userType, this.props.selectedGrade)
    if(this.props.userType === 1 && this.props.selectedGrade) {
      return (
      <Student 
        school={this.props.selectedSchool}
        grade={this.props.selectedGrade}
        student={this.props.selectedStudent}
        onSave={(student, grade)=>{this.saveStudent(student, grade)}}
        onUpdate={(student)=>{this.updateStudent(student)}}
        onDelete={(student)=>{this.deleteStudent(student)}}
        onSelectStudent={(student)=>{this.setStudent(student)}}
        />
      )
    } else if(this.props.userType === 0) {
      return (
      <Grade 
        updateType={this.props.gradeActionType}
        grade={this.props.selectedGrade}
        onSave={(gradeInfo)=>{this.saveGrade(this.props.selectedSchool, gradeInfo)}}
        onUpdate={(grade, gradeInfo)=>{this.updateGrade(grade, gradeInfo)}}
        onDelete={(grade)=>{this.deleteGrade(grade)}}
        />
      )
    } else {
      return <div/>
    }
  }

  renderUnauthenticated() {
    if(this.props.userType === -1) {
      return (
        <div>
                <h1>Trust the System</h1>
                <p>
                  This EOS dApp is leveling the playing field for school lottery admissions. 
                  Hogwarts has received multiple complaints about unfair admission practices to the school of Witchcraft and Wizardry 
                  and has created this solution.
                  <br/><br/>
                  <h3>Roles</h3>
                  <ul>
                    <li><b>Superintendent</b> - Inputs total openings per grade, runs lottery</li>
                    <li><b>Parent</b> - Inputs parent/student information</li>
                  </ul>
                </p>
                </div>
      )
    } else {
      return null
    }
  }

  renderSchool(school) {

    const deleteButton = <button
    className="pure-button pure-button-xsmall"
    onClick={()=>{this.deleteSchool(school)}}>Delete</button>

    const lotteryButton = <button
    className="pure-button pure-button-xsmall"
    onClick={()=>{this.runLottery(school)}}>Run Lottery</button>

    let actionView = null
        if(this.props.userType === 0) {
            actionView = <div>
            {school.status !== 1?lotteryButton:null} 
            &nbsp;&nbsp;         
            {school.status !== 1?deleteButton:null} 
            &nbsp;&nbsp;        
            <button
                    className="pure-button pure-button-xsmall"
                    onClick={()=>{
                      this.props.dispatch(manageSchool(school))
                      }}>Select</button>  
        </div>
        } else if(this.props.userType === 1) {
          actionView = <button
                    className="pure-button pure-button-xsmall"
                    onClick={()=>{
                      this.props.dispatch(manageSchool(school))
                    }}>Select</button>
        }

    let actionCell = this.props.userType === -1 ? null : <td>{actionView}</td>

    return (
      <tr key={school.key}>
          <td>{school.name}</td>
          <td>{school.status===0?'Open':'Closed'}</td>
          {actionCell}
      </tr>
  )
  }

  renderSelectedSchool() {
    let schoolView = null
    if(this.props.selectedSchool) {
      return (
      <School
        school={this.props.selectedSchool}
        grade={this.props.selectedGrade}
        isAdmin={this.props.userType === 0}
        onManageStudents={(grade)=>{this.manageStudents(grade)}}
        onUpdateSchool={(school, name)=>{this.updateSchool(school, name)}}
        onEditGrade={(grade)=>{this.editGrade(grade)}}
        onAddGrade={(grade)=>{this.addGrade(grade)}}
        onDeleteGrade={(grade)=>{this.deleteGrade(grade)}}
      />
      );
    }
    return schoolView
  }

  renderSchools() {

    let schools = []
    if(this.props.schools) {
      this.props.schools.forEach(school => {
        schools.push(this.renderSchool(school))    
      })
    }

    let actionHead = this.props.userType === -1 ? null : <th>Action</th>

    return (
      <table className="pure-table pure-table-horizontal">
        <thead>
            <tr>
                <th>Name</th>
                <th>Status</th>
                {actionHead}
            </tr>
        </thead>
        <tbody>
            {schools}
        </tbody>
      </table>
    )

  }
 
  renderAddSchool(){
    if(this.props.userType === 0) {
        return (
            <button
                className="pure-button pure-button-primary"
                onClick={()=>{this.newSchool()}}>
                Add School
            </button>
        )
    } else {
        return null
    }
  }

  renderError() {
    if(this.props.error) {
      return <div>
      <h4 style={{color: "red", size: 20}}>{this.props.error}</h4>
    </div>
    } else {
      return null
    }
  }

  render() {

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            {this.renderAuthenticateButtons()}
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <br/>
              {this.renderUnauthenticated()}
              {this.renderError()}
              <div className="pure-g">
                <div className="pure-u-1-2">
                  <h4>Schools</h4>
                  {this.renderSchools()}
                  <br />
                  {this.renderAddSchool()}
                  </div>
                  <div className="pure-u-1-2">
                    {this.renderSelectedSchool()}
                  </div>
                </div>
              <hr />
              {this.renderUserView()}
            </div>
          </div>
        </main>
      </div>
    );
  }
}

App.propTypes = {
  schools: PropTypes.array
};

function mapStateToProps(state) {
  return {
      identity: state.eos.identity,
      account: state.eos.account,
      error: state.eos.error,
      userType: state.eos.userType,
      schools: state.eos.schools,
      selectedSchool: state.eos.selectedSchool,
      selectedStudent: state.eos.selectedStudent,
      selectedGrade: state.eos.selectedGrade,
      gradeActionType: state.eos.gradeActionType,
      studentActionType: state.eos.studentActionType
  };
}

export default connect(
  mapStateToProps,
)(App);
