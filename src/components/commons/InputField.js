import React from 'react';
import 'assets/styles/Form.css';

const InputField = ({ id, label, type, placeholder, icon: Icon, value, onChange, name }) => (
    <div className="input-field-container">
        <label htmlFor={id} className="input-label">{label}</label>
        <div className="input-wrapper">
            {Icon && <Icon className="input-icon-form" />}
            <input
                type={type}
                id={id}
                name={name || id}
                className="input-element"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
            />
        </div>
    </div>
);

export default InputField;