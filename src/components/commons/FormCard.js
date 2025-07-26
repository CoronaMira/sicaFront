import React from 'react';
import 'assets/styles/Form.css';

const FormCard = ({ title, icon: Icon, children }) => (
    <div className="form-card">
        <div className="form-card-header">
            {Icon && <Icon className="form-card-icon" />}
            <h2 className="form-card-title">{title}</h2>
        </div>
        {children}
    </div>
);

export default FormCard;