import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoanWorkflowHandler } from './handlers/loan-workflow.handler';
import { getModelToken } from '@nestjs/mongoose';
import { LoanApplication } from './schemas/loan-application.schema';
import { WorkflowStatus } from '../../../common/enums';

describe('LoanWorkflowHandler', () => {
  let handler: LoanWorkflowHandler;
  let eventEmitter: EventEmitter2;
  let loanApplicationModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanWorkflowHandler,
        EventEmitter2,
        {
          provide: getModelToken(LoanApplication.name),
          useValue: {
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<LoanWorkflowHandler>(LoanWorkflowHandler);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    loanApplicationModel = module.get(getModelToken(LoanApplication.name));
  });

  it('should handle workflow approved event', async () => {
    const payload = {
      workflowType: 'LOAN_APPLICATION',
      requestData: {
        loanApplicationId: '507f1f77bcf86cd799439011'
      },
      approvedAmount: 500000
    };

    await handler.handleWorkflowApproved(payload);

    expect(loanApplicationModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      {
        status: WorkflowStatus.APPROVED,
        approvalDate: expect.any(Date),
        approvedAmount: 500000
      }
    );
  });
});