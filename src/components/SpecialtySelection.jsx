import { useState, useEffect } from 'react'
import './SpecialtySelection.css'

const SpecialtySelection = ({ onSelectSpecialty }) => {
  const specialties = [
    {
      id: 'gdm',
      name: 'GDM: 妊娠糖尿病專家',
      description: '專業妊娠期糖尿病諮詢',
      image: '/static/images/female_doctor.jpg',
      role: 'nutritionist',
      roleName: '營養師'
    },
    {
      id: 'ckd', 
      name: 'CKD: 慢性腎臟病專家',
      description: '專業慢性腎臟病諮詢',
      image: '/static/images/male_doctor.jpg',
      role: 'doctor',
      roleName: '藥劑師'
    },
    {
      id: 'ppd',
      name: 'PPD: 產後憂鬱症專家', 
      description: '專業產後憂鬱症諮詢',
      image: '/static/images/female_doctor.jpg',
      role: 'counselor',
      roleName: '心理諮商師'
    }
  ]

  const handleSelectSpecialty = (specialty) => {
    // 儲存選擇的專科到 localStorage
    localStorage.setItem('selectedSpecialty', specialty.id)
    localStorage.setItem('selectedDoctor', specialty.image)
    localStorage.setItem('selectedRole', specialty.role)
    localStorage.setItem('selectedRoleName', specialty.roleName)
    
    onSelectSpecialty(specialty)
  }

  return (
    <div className="specialty-container">
      <div className="specialty-wrapper">
        <h1>選擇醫療諮詢專科</h1>
        
        <div className="specialty-list">
          {specialties.map(specialty => (
            <div 
              key={specialty.id}
              className="specialty-item"
              onClick={() => handleSelectSpecialty(specialty)}
            >
              <img 
                src={specialty.image} 
                alt={specialty.roleName} 
                className="specialty-avatar"
              />
              <div className="specialty-info">
                <h3>{specialty.name}</h3>
                <p>{specialty.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SpecialtySelection