import React from 'react'
import { 
  Card as MuiCard, 
  CardContent, 
  CardActions, 
  CardHeader,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip
} from '@mui/material'
import { MoreVert, Favorite, Share } from '@mui/icons-material'


const Card= ({
  title,
  subtitle,
  content,
  imageUrl,
  avatarUrl,
  tags = [],
  likeCount = 0,
  shareCount = 0,
  variant = 'elevation',
  maxWidth = 400,
  onClick,
  onLike,
  onShare,
  onMenuClick,
}) => {
  return (
    <MuiCard
      variant={variant}
      sx={{ 
        maxWidth,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform)',
          boxShadow: 3,
        } : {}
      }}
      onClick={onClick}
    >
      <CardHeader
        avatar={
          avatarUrl ? (
            <Avatar src={avatarUrl} aria-label="avatar" />
          ) : (
            <Avatar aria-label="avatar">
              {title.charAt(0).toUpperCase()}
            </Avatar>
          )
        }
        action={
          onMenuClick && (
            <IconButton aria-label="settings" onClick={( => {
              e.stopPropagation()
              onMenuClick()
            }}>
              <MoreVert />
            </IconButton>
          )
        }
        title={title}
        subheader={subtitle}
      />
      
      {imageUrl && (
        <Box
          component="img"
          sx={{
            height: 200,
            width: '100%',
            objectFit: 'cover',
          }}
          src={imageUrl}
          alt={title}
        />
      )}
      
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {content}
        </Typography>
        
        {tags.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {tags.map((tag, index) => (
              <Chip 
                key={index} 
                label={tag} 
                size="small" 
                variant="outlined" 
              />
            ))}
          </Box>
        )}
      </CardContent>
      
      {(onLike || onShare) && (
        <CardActions disableSpacing>
          {onLike && (
            <IconButton 
              aria-label="add to favorites"
              onClick={( => {
                e.stopPropagation()
                onLike()
              }}
            >
              <Favorite />
              {likeCount > 0 && (
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {likeCount}
                </Typography>
              )}
            </IconButton>
          )}
          
          {onShare && (
            <IconButton 
              aria-label="share"
              onClick={( => {
                e.stopPropagation()
                onShare()
              }}
            >
              <Share />
              {shareCount > 0 && (
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {shareCount}
                </Typography>
              )}
            </IconButton>
          )}
        </CardActions>
      )}
    </MuiCard>
  )
}

export default Card