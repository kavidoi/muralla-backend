import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';
export declare class AppBootstrapService implements OnModuleInit {
    private usersService;
    private prisma;
    constructor(usersService: UsersService, prisma: PrismaService);
    onModuleInit(): Promise<void>;
}
export declare class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}
