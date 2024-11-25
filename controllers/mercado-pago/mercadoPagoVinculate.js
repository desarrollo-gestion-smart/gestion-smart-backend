// const express = require ('express');
// const axios = require ('axios')
// const autenticateJWT = require ('../authController')
// const User = require ('../../models/users')
// const router = express.Router()
// const {findById} = require('../../models/users')


// router.get('/api/mercadopago/callback', authenticateJWT, async (req, res) => {
//     const { code } = req.query;
  
//     if (!code) {
//       return res.status(400).json({ error: 'Authorization code not provided' });
//     }
  
//     const userId = req.user?.userId;
  
  
//     try {
//       const response = await axios.post(
//           'https://api.mercadopago.com/oauth/token',
//           new URLSearchParams({
//             grant_type: 'authorization_code',
//             client_id: process.env.MP_CLIENT_ID,
//             client_secret: process.env.MP_CLIENT_SECRET,
//             redirect_uri: process.env.MP_REDIRECT_URI,
//             code,
//           }),
//           {
//             headers: {
//               'Content-Type': 'application/x-www-form-urlencoded',
//             },
//           }
//       );
  
//       const { access_token, refresh_token, user_id, expires_in } = response.data;
  
//       const user = await User.findById(userId);
  
//       if (!user) {
//         return res.status(404).json({ message: 'Usuario no encontrado' });
//       }
//       if (user.wallet?.mercadoPago?.accessToken) {
//         return res.status(400).json({ message: 'Ya tienes una billetera vinculada' });
//       }
  
//       await User.findByIdAndUpdate(
//           userId,
//           {
//             $set: {
//               'wallet.mercadoPago': {
//                 accessToken: access_token,
//                 refreshToken: refresh_token,
//                 userId: user_id,
//                 expiresIn: expires_in,
//                 linkedAt: new Date(),
//               },
//             },
//           },
//           { new: true, upsert: true }
//       );
  
//      // res.status(200).json({ message: 'Wallet linked successfully' });
//       res.redirect('http://localhost:3000/apps/wallet/vinculate?success=true');
  
//     } catch (error) {
  
//       console.error('Error exchanging code for token:', error.response?.data || error.message);
//       res.status(500).json({ error: 'Error linking wallet' });
  
//     }
//   });
//   router.get('/api/mercadopago/wallet-status', authenticateJWT, async (req, res) => {
//     const userId = req.user.userId;
//     try {
//       const user = await User.findById(userId);
  
//       if (!user) {
//         return res.status(404).json({ message: 'Usuario no encontrado' });
//       }
  
//       const walletLinked = !!user.wallet?.mercadoPago?.accessToken;
//       const mercadoPagoId = walletLinked ? user.wallet.mercadoPago.userId : null;
  
//       res.status(200).json({ walletLinked, mercadoPagoId });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Error al verificar el estado de la wallet' });
//     }})

//     module.exports = router;
