import { useState, useRef } from 'react'
import './Sidebar.css'

const Sidebar = ({ isHidden, onSelectCharacter, selectedDoctor, selectedRole }) => {
  const characters = [
    {
      src: '/static/images/male_doctor.jpg',
      role: 'doctor',
      name: '藥劑師'
    },
    {
      src: '/static/images/female_doctor.jpg', 
      role: 'nutritionist',
      name: '營養師'
    }
  ]

  const handleSelectCharacter = (character) => {
    onSelectCharacter(character.src, character.role, character.name)
  }

  return (
    <aside className={`sidebar ${isHidden ? 'hidden' : ''}`}>
      <h2>選擇要諮商的虛擬醫事人員</h2>
      <div className="character-list">
        {characters.map((character, index) => (
          <div key={index} className="character-item">
            <img 
              src={character.src} 
              alt={character.name} 
              className={`thumbnail ${selectedDoctor === character.src ? 'selected' : ''}`}
              onClick={() => handleSelectCharacter(character)}
            />
            <b>{character.name}</b>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar