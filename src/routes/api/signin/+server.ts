import { adminAuth } from '$lib/server/admin';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { auth } from '$lib/firebase';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            throw error(400, 'ID Token is required');
        }

        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const decodedIdToken = await adminAuth.verifyIdToken(idToken);
        
        console.log('Decoded ID Token:', decodedIdToken); // Adicione logs para verificar o token

        if (!decodedIdToken) {
            throw error(401, 'Invalid ID Token');
        }

        // CRIA UM CUSTOM TOKEN PARA O USUÁRIO AUTENTICAR NOVAMENTE NO FRONT-END
        const customToken = await adminAuth.createCustomToken(decodedIdToken.uid);

        // FINALIZA A AUTENTICAÇÃO NO FRONT-END
        await signInWithCustomToken(auth, customToken);

        if (Math.floor(Date.now() / 1000) - decodedIdToken.auth_time < 5 * 60) {
            const cookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
            const options = { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' };
            // -- OPTIONS PARA QUANDO ESTIVER EM PRODUÇÃO const options = { maxAge: expiresIn, httpOnly: true, secure: true, path: '/' };
            cookies.set('__session', cookie, options);

            return json({ status: 'signedIn' });
        } else {
            throw error(401, 'Recent sign in required!');
        }
    } catch (err) {
        console.error('Sign in error:', err);
        throw error(500, 'Internal Server Error');
    }
};

export const DELETE: RequestHandler = async ({ cookies }) => {
    cookies.delete('__session', { path: '/' });
    return json({ status: 'signedOut' });
};
