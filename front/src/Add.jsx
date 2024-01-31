import React, { useState } from 'react'
import axios from 'axios';

function Add() {

    const [input,setInput] = useState([])

    const change=(event)=>
    {
          const name = event.target.name;
          const value = event.target.value;
          setInput(values =>({...values,[name]: value}));
    }
  
    const Submit=async(event)=>
    {
      event.preventDefault();
      await axios.post("http://localhost:5000/add", input).then(function(response)
      {
        console.log("data",response);
      });
    }
  return (
    <div>
      <h3>Ajouter nouvel information</h3>
      <br />
      <br />
      <br />
      <form action="" onSubmit={Submit}>
        <input type="text" onChange={change} name='nom' placeholder='Nom et prenom' />
        <input type="text" onChange={change} name='email' placeholder='Entrer votre email' />
        <input type="text" onChange={change} name='niveau' placeholder='Niveau' />
        <input type="text" onChange={change} name='parcours' placeholder='Parcors' />
        <input type="text" onChange={change} name='matricule' placeholder='Matricule' />
        <br />
        <br />
        <br />
        <button>Enregistrer</button>
      </form>
    </div>
  )
}

export default Add
