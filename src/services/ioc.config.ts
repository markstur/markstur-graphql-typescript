import { ContainerConfiguration, Scope } from 'typescript-ioc';
import { HelloWorldApi } from './hello-world.api';
import { HelloWorldService } from './hello-world.service';
import { CalculatorApi } from './calculator.api';
import { CalculatorService } from './calculator.service';
import { ConverterApi } from './converter.api';
import { ConverterService } from './converter.service';
import { ProjectApi } from './project.api';
import { ProjectService } from './project.service';
import { TaskApi } from './task.api';
import { TaskService } from './task.service';

const config: ContainerConfiguration[] = [
  {
    bind: HelloWorldApi,
    to: HelloWorldService,
    scope: Scope.Singleton,
  },
  {
    bind: ProjectApi,
    to: ProjectService,
    scope: Scope.Singleton,
  },
  {
    bind: TaskApi,
    to: TaskService,
    scope: Scope.Singleton,
  },
  {
    bind: ConverterApi,
    to: ConverterService,
    scope: Scope.Singleton,
  },
  {
    bind: CalculatorApi,
    to: CalculatorService,
    scope: Scope.Singleton,
  },
];

export default config;
