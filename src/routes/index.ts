import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import UserRoutes from './UserRoutes';
import livekitRouter from './livekit';
import roomRouter from './room';


/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();


// ** Add UserRouter ** //

// Init router
const userRouter = Router();

// Get all users
userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

apiRouter.use('/users', userRouter);
apiRouter.use('/livekit', livekitRouter);  // ✅ add this
apiRouter.use('/rooms', roomRouter);

// Add UserRouter
apiRouter.use(Paths.Users.Base, userRouter);


/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
