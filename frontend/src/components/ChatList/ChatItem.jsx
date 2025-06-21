import { 
  Avatar, 
  ListItem, 
  ListItemText, 
  Typography, 
  Badge,
  ListItemButton,
  ListItemIcon,
  Box
} from '@mui/material';
import { Person as PersonIcon, Groups as GroupsIcon } from '@mui/icons-material';

export default function ChatItem({ 
  chat, 
  onClick, 
  isActive,
  selected
}) {
  return (
    <ListItem 
      disablePadding
      sx={{
        backgroundColor: isActive ? 'action.selected' : 'inherit',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <ListItemButton 
        onClick={onClick}
        selected={isActive}
        sx={{
          py: 1.5,
          px: 2
        }}
      >
        <ListItemIcon sx={{ minWidth: 48 }}>
          <Badge 
            badgeContent={chat.unreadCount} 
            color="primary" 
            overlap="circular"
            invisible={!chat.unreadCount}
          >
            <Avatar 
              sx={{ 
                bgcolor: chat.isGroup ? 'secondary.main' : 'primary.main',
                width: 40, 
                height: 40 
              }}
            >
              {chat.isGroup ? (
                <GroupsIcon fontSize="small" />
              ) : (
                <PersonIcon fontSize="small" />
              )}
            </Avatar>
          </Badge>
        </ListItemIcon>

        <ListItemText
          primary={
            <Typography 
              fontWeight={chat.unreadCount ? 'bold' : 'normal'}
              noWrap
            >
              {chat.name}
            </Typography>
          }
          secondary={
            <Box
              component="span"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography
                variant="body2"
                color={isActive ? 'primary.contrastText' : 'text.secondary'}
                noWrap
                sx={{
                  flex: 1,
                  fontWeight: chat.unreadCount ? 'medium' : 'normal'
                }}
              >
                {chat.lastMessage || 'Нет сообщений'}
              </Typography>
              {chat.timestamp && (
                <Typography
                  variant="caption"
                  color={isActive ? 'primary.contrastText' : 'text.secondary'}
                >
                  {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              )}
            </Box>
          }
          sx={{
            my: 0,
            ml: 1
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}