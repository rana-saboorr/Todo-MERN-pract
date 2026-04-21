import { createSlice } from "@reduxjs/toolkit";

const todoSlice = createSlice({
  name: "todos",
  initialState: {
    todos: []
  },

  reducers: {

    setTodos: (state, action) => {
      state.todos = action.payload; // It replaces the entire todo list in Redux with new data. when fetch from db
    },

    addTodo: (state, action) => {
      state.todos.push(action.payload); //Adds a new todo to the existing array.
    },

    deleteTodo: (state, action) => {
      state.todos = state.todos.filter(  
        (todo) => todo._id !== action.payload  // todo 
      );
    }

  }
});

export const { setTodos, addTodo, deleteTodo } = todoSlice.actions;

export default todoSlice.reducer;