package com.opensourceiq.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AuthTicketServiceTest {

    @Test
    void ticketsAreSingleUse() {
        AuthTicketService ticketService = new AuthTicketService();
        String ticket = ticketService.createTicket("token-value");

        assertThat(ticketService.consumeTicket(ticket)).contains("token-value");
        assertThat(ticketService.consumeTicket(ticket)).isEmpty();
    }
}
