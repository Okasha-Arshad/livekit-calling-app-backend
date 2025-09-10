import { Router } from 'express';
import Paths from '@src/common/constants/Paths';
import UserRoutes from './UserRoutes';
import livekitRouter from './livekit';
import roomRouter from './room';
import sessionRoutes from './sessionRoutes';

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// ------------------- User Routes ------------------- //
const userRouter = Router();
userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

// Mount all routes
apiRouter.use(Paths.Users.Base, userRouter);
apiRouter.use('/livekit', livekitRouter);
apiRouter.use('/rooms', roomRouter);
apiRouter.use('/sessions', sessionRoutes);

/******************************************************************************
                               Export default
******************************************************************************/

export default apiRouter;