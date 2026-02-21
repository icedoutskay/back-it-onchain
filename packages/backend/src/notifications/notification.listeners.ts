import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './notification.entity';
import {
  MarketResolvedEvent,
  StakeReceivedEvent,
  NewFollowerEvent,
} from './notification-events.service';

@Injectable()
export class NotificationListeners {
  constructor(private notificationsService: NotificationsService) {}

  @OnEvent('market.resolved')
  async handleMarketResolved(event: MarketResolvedEvent): Promise<void> {
    // Notify creator
    await this.notificationsService.create({
      recipientWallet: event.creatorWallet,
      type: NotificationType.MARKET_RESOLVED,
      payload: {
        callId: event.callId,
        callTitle: event.callTitle,
        outcome: event.outcome,
        totalParticipants: event.stakers.length,
      },
      resourceId: event.callId.toString(),
      resourceType: 'call',
    });

    // Notify all stakers
    for (const staker of event.stakers) {
      await this.notificationsService.create({
        recipientWallet: staker.wallet,
        type: NotificationType.MARKET_RESOLVED,
        payload: {
          callId: event.callId,
          callTitle: event.callTitle,
          outcome: event.outcome,
          userChoice: staker.choice,
          userAmount: staker.amount,
          userWon: staker.choice === event.outcome,
        },
        resourceId: event.callId.toString(),
        resourceType: 'call',
      });
    }
  }

  @OnEvent('stake.received')
  async handleStakeReceived(event: StakeReceivedEvent): Promise<void> {
    // Only notify the creator of the call
    await this.notificationsService.create({
      recipientWallet: event.creatorWallet,
      type: NotificationType.STAKE_RECEIVED,
      payload: {
        callId: event.callId,
        callTitle: event.callTitle,
        staker: event.staker,
        amount: event.amount,
        choice: event.choice,
      },
      resourceId: event.callId.toString(),
      resourceType: 'call',
    });
  }

  @OnEvent('follower.new')
  async handleNewFollower(event: NewFollowerEvent): Promise<void> {
    await this.notificationsService.create({
      recipientWallet: event.followedWallet,
      type: NotificationType.NEW_FOLLOWER,
      payload: {
        follower: event.follower,
        followerHandle: event.followerHandle,
        followerAvatar: event.followerAvatar,
      },
      resourceId: event.follower,
      resourceType: 'user',
    });
  }
}
