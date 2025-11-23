package telegram

import (
	"encoding/json"
	"fmt"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
	"io"
	"net/http"
	"net/url"
	"path"
	"strconv"
)

const (
	tgBotHost = "api.telegram.org"

	sendMessageMethod = "sendMessage"
	getUpdatesMethod  = "getUpdates"

	parseMode      = "MarkdownV2"
	disablePreview = `{"is_disabled": true}`
)

type TGClient struct {
	host       string
	httpClient http.Client
}

func New() *TGClient {
	return &TGClient{
		host:       tgBotHost,
		httpClient: http.Client{},
	}
}

func (c *TGClient) Updates(token string, offset, limit int) ([]*model.Update, error) {
	q := url.Values{}
	q.Add("offset", strconv.Itoa(offset))
	q.Add("limit", strconv.Itoa(limit))

	data, err := c.doRequest(token, getUpdatesMethod, q)
	if err != nil {
		return nil, fmt.Errorf("can't get updates: %w", err)
	}

	var resp model.UpdatesResponse

	if json.Unmarshal(data, &resp) != nil {
		return nil, fmt.Errorf("can't get updates: %w", err)
	}

	return resp.Result, nil
}

func (c *TGClient) Send(token string, chatID int, msg string, withFormat bool) (*model.Response, error) {
	q := url.Values{}
	q.Add("chat_id", strconv.Itoa(chatID))
	q.Add("text", msg)

	if withFormat {
		q.Add("parse_mode", parseMode)
		q.Add("link_preview_options", disablePreview)
	}

	byteResp, err := c.doRequest(token, sendMessageMethod, q)
	if err != nil {
		return nil, fmt.Errorf("can't send message: %w", err)
	}

	resp := &model.Response{}
	if err := json.Unmarshal(byteResp, resp); err != nil {
		return nil, fmt.Errorf("can't parse response: %w", err)
	}

	return resp, nil
}

func (c *TGClient) SendWithReplyKeyboard(token string, chatID int, msg string, keyboard *model.ReplyKeyboardMarkup, withFormat bool) (*model.Response, error) {
	q := url.Values{}
	q.Add("chat_id", strconv.Itoa(chatID))
	q.Add("text", msg)

	if withFormat {
		q.Add("parse_mode", parseMode)
		q.Add("link_preview_options", disablePreview)
	}

	if keyboard != nil {
		kbJSON, err := json.Marshal(keyboard)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal keyboard: %w", err)
		}
		q.Add("reply_markup", string(kbJSON))
	}

	byteResp, err := c.doRequest(token, sendMessageMethod, q)
	if err != nil {
		return nil, fmt.Errorf("can't send message: %w", err)
	}

	resp := &model.Response{}
	if err := json.Unmarshal(byteResp, resp); err != nil {
		return nil, fmt.Errorf("can't parse response: %w", err)
	}

	return resp, nil
}

func newBasePath(token string) string {
	return "bot" + token
}

func (c *TGClient) doRequest(token, method string, query url.Values) ([]byte, error) {
	u := url.URL{
		Scheme:   "https",
		Host:     c.host,
		Path:     path.Join(newBasePath(token), method),
		RawQuery: query.Encode(),
	}

	resp, err := c.httpClient.Get(u.String())
	if err != nil {
		return nil, fmt.Errorf("can't do request: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("can't do request: %w", err)
	}

	return body, nil
}
