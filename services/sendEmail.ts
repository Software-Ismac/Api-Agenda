export const sendEmail = async (
  email: string,
  confirmationCode: any,
  token: any
) => {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Verificación de seguridad <support@llampukaq.com>",
      to: email,
      subject: "Verificación de seguridad",
      html: `<div style="width:100%; font-family: 'Inter', Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; padding: 0; margin: 0;">
     <div dir="ltr" class="es-wrapper-color" lang="und" style="background-color: #F6F6F6;">
       <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="border-collapse: collapse; width: 100%; height: 100%; background-color: #F6F6F6;">
         <td valign="top" style="padding: 0; margin: 0;">
           
   
           <section style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff;">
             <header>
               
               <h2 style="font-family: 'Inter', Arial, sans-serif; font-size: 32px; font-weight: bold; color: #191335;">Autenticación en dos pasos</h2>
             </header>
   
             <section style="padding: 20px 0;">
               <p style="font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #191335;">Hola Camaleon</p>
               <p style="font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #191335;">Para mejorar la seguridad de tu cuenta, requerimos autenticación en dos pasos para el acceso. Aquí está tu código 2FA:</p>
             </section>
   
             <section style="background-color: #f2fbff; padding: 30px; text-align: center;">
               <h2 style="font-family: 'Inter', Arial, sans-serif; font-size: 32px; font-weight: bold; color: #191335;">${confirmationCode}</h2>
               <p style="font-family: 'Inter', Arial, sans-serif; font-size: 13px; color: #999999;">El código expira en 5 minutos.</p>
             </section>
   
             <section style="padding: 20px 0;">
               <p style="font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #191335;">Por favor, ingresa este código en el aviso de inicio de sesión para acceder a tu cuenta. Si no solicitaste este código o no estás intentando acceder a tu cuenta, por favor contáctanos inmediatamente para obtener soporte.</p>
               <p style="font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #191335;">Para mayor seguridad, considera actualizar tu contraseña y revisar los ajustes de tu cuenta regularmente.</p>
             </section>
   
             <section style="padding: 20px 0; text-align: center;">
               <a href="https://viewstripo.email" style="display: inline-block; background-color: #2B5D68; padding: 10px 20px; font-family: 'Nunito', 'Roboto', sans-serif; font-size: 18px; color: #FFFFFF; border-radius: 30px; text-decoration: none;">Visita tu cuenta</a>
             </section>
   
             <section style="padding: 30px 0; text-align: center;">
               <img src="https://tlr.stripocdn.email/content/guids/CABINET_8b5e474e81c4e451743e688436903b88154bd4a89788b5422d281d38b1133dc2/images/shieldcheck_1.png" alt="Security" width="40" style="display: block; margin: 0 auto;">
               <h2 style="font-family: 'Inter', Arial, sans-serif; font-size: 24px; font-weight: bold; color: #191335;">Consejos de Seguridad</h2>
               <ul style="list-style: none; padding: 0;">
                 <li style="font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #191335; margin-bottom: 15px;">Nunca compartas tus códigos 2FA con nadie.</li>
                 <li style="font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #191335; margin-bottom: 15px;">Activa las notificaciones para todas las actividades de tu cuenta.</li>
                 <li style="font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #191335; margin-bottom: 15px;">Usa un dispositivo confiable y una conexión segura cuando accedas a tu información financiera.</li>
               </ul>
             </section>
           </section>
   
           
         </td>
       </table>
     </div>
   </div>
   `,
    }),
  });
};
