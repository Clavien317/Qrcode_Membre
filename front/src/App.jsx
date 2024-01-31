import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [qrcode, setQR] = useState([]);

  useEffect(()=>
  {
      affiche()
  },[])

const affiche =async()=>
{
  const n = await axios.get('http://localhost:5000')
  console.log(n.data.qr);

  setQR(n.data.qr)
}

  return (
    <div>
      <ul>
        <li>
          <a href="/add">Ajouter etudiant</a>
        </li>
      </ul>
      <h2>Liste de nos QRCode</h2>
      <ul>
        {qrcode.map(qrCode => (
          <li key={qrCode.matricule}>
            <li>
              {qrCode.matricule}
            </li>
            <img src={qrCode.code} alt={`QR Code ${qrCode.matricule}`} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
