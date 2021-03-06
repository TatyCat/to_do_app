import React, { Component } from 'react'
import axios from 'axios'
import AddItemForm from './AddItemForm'
import ListItem from './ListItem'

class ToDoList extends Component {
  state = {
    newTaskItem: '',
    todoList: [],
    accessToken: 'xiii'
  }

  getApiUrl = () => {
    return `http://localhost:3000/lists?access_token=#{this.state.accessToken}`
  }

  updateStateWithNewItem = event => {
    this.setState({
      newTaskItem: event.target.value
    })
  }

  componentDidMount() {
    this.getListFromAPI()
    // check local storage for a token
    const token = localStorage.getItem('list-access-token')
    if (token) {
      this.setState(
        {
          accessToken: token
        },
        () => {
          this.getListFromAPI()
        }
      )
    }
  }

  getListFromAPI = () => {
    // go to the API
    axios.get(this.getApiUrl())
      .then(resp => {
        // populate state with the todo list
        this.setState({
          todoList: resp.data
        })
        // console.log(this.state.todoList)
      })
  }

  // localhost:3000/lists/38?access_token=xiii
  markComplete = (id, completion_status) => {
    const url = `http://localhost:3000/lists/${id}?access_token=${this.state.accessToken}`
    console.log(completion_status)

    if (!completion_status) {
      axios.patch(
        url,
        {
          "list": {
            "complete": true
          }
        }
      ).then(() =>
        this.getListFromAPI()
      )
    }
    else if (completion_status) {
      axios.patch(
        url,
        {
          "list": {
            "complete": false
          }
        }
      ).then(() =>
        this.getListFromAPI()
      )
    }
  }


  // localhost:3000/lists/7?access_token=xiii
  deleteItem = task => {
    const url = `http://localhost:3000/lists/${task}?access_token = ${this.state.accessToken} `
    axios.delete(url).then(resp => {
      this.getListFromAPI()
    })
  }

  addItemToApi = event => {
    event.preventDefault()

    if (this.state.newTaskItem !== "") {
      axios
        .post(this.getApiUrl(), {
          "list": {
            "task": this.state.newTaskItem,
            "complete": false,
            "token": this.state.accessToken
          }
        })
        .then(resp => {
          // update state to clear out the input field
          this.setState({ newTaskItem: '' })
          // ***Gavin: Why did I have to add line 76 to clear the input box? Line 74 doens't clear out the input box like it's suppposed to. 
          document.getElementById("newItem").value = "";
          // get lateset list form API
          this.getListFromAPI()
        })
    }
  }

  generateRandomToken = () => {
    // creat a new string that is 20 random characters long
    return Math.floor(Math.random() * Math.pow(10, 20)).toString()
  }

  resetList = () => {
    // // reset the state
    // // reset toDoList
    // // reset the newTaskItem
    // // create new token

    axios.delete('http://localhost:3001/lists/destroy_all')
      .then(() => console.log(this))

  }

  render() {
    return (
      <>
        <AddItemForm
          addItemToApi={this.addItemToApi}
          newTaskItem={this.state.newTaskItem}
          updateStateWithNewItem={this.updateStateWithNewItem}
        />
        <p className="output" />
        <ol className="todo-list">
          {this.state.todoList.map(task_item => {
            return (
              < ListItem
                key={task_item.id}
                id={task_item.id}
                markComplete={this.markComplete}
                task={task_item.task}
                deleteItem={this.deleteItem}
                complete={task_item.complete}
              />
            )
          })}
        </ol>

        <button className="reset-button" onClick={this.resetList}>RESET LIST</button>
      </>
    )
  }
}

export default ToDoList
