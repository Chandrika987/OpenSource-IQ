package com.opensourceiq.security;

import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthTicketService {

    private static final long TICKET_TTL_SECONDS = 60;

    private final Clock clock;
    private final Map<String, Ticket> tickets = new ConcurrentHashMap<>();

    public AuthTicketService() {
        this(Clock.systemUTC());
    }

    AuthTicketService(Clock clock) {
        this.clock = clock;
    }

    public String createTicket(String token) {
        pruneExpiredTickets();
        String ticket = UUID.randomUUID().toString();
        tickets.put(ticket, new Ticket(token, Instant.now(clock).plusSeconds(TICKET_TTL_SECONDS)));
        return ticket;
    }

    public Optional<String> consumeTicket(String ticket) {
        if (ticket == null || ticket.isBlank()) {
            return Optional.empty();
        }

        Ticket storedTicket = tickets.remove(ticket);
        if (storedTicket == null || storedTicket.expiresAt().isBefore(Instant.now(clock))) {
            return Optional.empty();
        }

        return Optional.of(storedTicket.token());
    }

    private void pruneExpiredTickets() {
        Instant now = Instant.now(clock);
        tickets.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
    }

    private record Ticket(String token, Instant expiresAt) {
    }
}
